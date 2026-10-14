import hashlib
import json
import secrets
import time
from typing import Dict, List, Optional, Any
from election_data import DEMO_VOTER_IDS, CONSTITUENCIES

def sha256_hex(data: str) -> str:
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

def compute_merkle_root(tx_hashes: List[str]) -> str:
    if not tx_hashes:
        return sha256_hex("empty_block")
    current_layer = tx_hashes
    while len(current_layer) > 1:
        next_layer = []
        for i in range(0, len(current_layer), 2):
            left = current_layer[i]
            right = current_layer[i + 1] if i + 1 < len(current_layer) else left
            next_layer.append(sha256_hex(left + right))
        current_layer = next_layer
    return current_layer[0]

class TransparentVotingBlockchain:
    def __init__(self):
        self.chain: List[Dict[str, Any]] = []
        self.mempool: List[Dict[str, Any]] = []
        # Internal nullifier set: stores sha256(voter_token + session_secret)
        # Prevents double voting in this demo session without ever publishing the voter's raw ID or tying it to their choice
        self._session_secret = secrets.token_hex(16)
        self._spent_nullifiers: set = set()
        # Internal private tally storage: keyed by constituency_code -> candidate_id -> count
        self._tally_store: Dict[str, Dict[str, int]] = {}
        # Valid synthetic demo tokens
        self.valid_tokens = {item["token"] for item in DEMO_VOTER_IDS}

        # Initialize Genesis Block
        self._create_genesis_block()

    def _create_genesis_block(self):
        genesis_tx = {
            "tx_id": "0x" + sha256_hex("genesis-transaction-ka-2023"),
            "timestamp": "2023-04-13T10:00:00Z",
            "constituency_code": "000",
            "ballot_commitment": "0x" + sha256_hex("genesis-null-state"),
            "merkle_leaf": sha256_hex("genesis-state-leaf"),
            "status": "finalized",
            "block_index": 0,
            "type": "GENESIS_ROOT",
            "note": "Karnataka Vidhana Sabha 2023 Demo Root State Commitment"
        }
        genesis_merkle = compute_merkle_root([genesis_tx["tx_id"]])
        genesis_block = {
            "index": 0,
            "timestamp": "2023-04-13T10:00:00Z",
            "transactions": [genesis_tx],
            "merkle_root": genesis_merkle,
            "previous_hash": "0" * 64,
            "nonce": 42,
            "difficulty": "00",
            "miner": "ECI-CEO-KA-SIMULATED-CORE",
            "hash": "00a4b7f89c01289de6f244519967c1e3428fb1734918e90c529ba879124032d1"
        }
        self.chain.append(genesis_block)

    def is_valid_demo_voter(self, token: str) -> bool:
        if not token:
            return False
        clean = token.strip().upper()
        # Accept KA-DEMO-1001 or standard test format
        return clean in self.valid_tokens or clean.startswith("KA-DEMO-") or clean.startswith("KA-VOTER-")

    def has_voted(self, token: str) -> bool:
        if not token:
            return False
        clean = token.strip().upper()
        nullifier = sha256_hex(clean + self._session_secret)
        return nullifier in self._spent_nullifiers

    def add_ballot(self, token: str, constituency_code: str, candidate_id: str) -> Dict[str, Any]:
        """
        Record a ballot choice into the mempool.
        Privacy Boundary:
        - Calculates nullifier to block duplicates without storing or publishing voter identity.
        - Generates public transaction ID and cryptographic zero-knowledge commitment.
        - The PUBLIC receipt returned to caller DOES NOT contain candidate_id or voter token!
        """
        clean_token = token.strip().upper()
        if not self.is_valid_demo_voter(clean_token):
            raise ValueError(f"Token '{clean_token}' is not a recognized simulation demo token.")

        nullifier = sha256_hex(clean_token + self._session_secret)
        if nullifier in self._spent_nullifiers:
            raise ValueError(f"This demo token has already cast a ballot in this demo session.")

        if constituency_code not in CONSTITUENCIES:
            raise ValueError(f"Constituency code '{constituency_code}' is not supported.")

        # Verify candidate exists in constituency
        valid_candidates = {c["id"]: c for c in CONSTITUENCIES[constituency_code]["candidates"]}
        if candidate_id not in valid_candidates:
            raise ValueError(f"Candidate ID '{candidate_id}' is not contesting in constituency {constituency_code}.")

        # Generate cryptographic blinding factor (secret salt)
        blinding_factor = secrets.token_hex(16)
        tx_salt = secrets.token_hex(8)
        iso_timestamp = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())

        # Public transaction attributes
        tx_id = "0x" + sha256_hex(f"{iso_timestamp}:{constituency_code}:{tx_salt}")
        ballot_commitment = "0x" + sha256_hex(f"{candidate_id}:{blinding_factor}")
        merkle_leaf = sha256_hex(f"{tx_id}:{ballot_commitment}")

        public_tx = {
            "tx_id": tx_id,
            "timestamp": iso_timestamp,
            "constituency_code": constituency_code,
            "ballot_commitment": ballot_commitment,
            "merkle_leaf": merkle_leaf,
            "status": "pending_mempool",
            "block_index": None,
            "type": "BALLOT_COMMITMENT",
            # Note: Voter ID and Choice are EXCLUDED from the public transaction record
        }

        # Internal confidential bookkeeping for aggregation & duplicate-prevention
        internal_tx = dict(public_tx)
        internal_tx["_private_candidate_id"] = candidate_id
        internal_tx["_private_nullifier"] = nullifier

        self.mempool.append(internal_tx)
        self._spent_nullifiers.add(nullifier)

        # Public Receipt returned to voter:
        # Crucial requirement: No candidate name, no party name, no voter ID!
        return {
            "success": True,
            "tx_id": tx_id,
            "timestamp": iso_timestamp,
            "constituency_code": constituency_code,
            "constituency_name": CONSTITUENCIES[constituency_code].get("name_en", CONSTITUENCIES[constituency_code].get("name", "")),
            "constituency_name_en": CONSTITUENCIES[constituency_code].get("name_en", CONSTITUENCIES[constituency_code].get("name", "")),
            "constituency_name_kn": CONSTITUENCIES[constituency_code].get("name_kn", ""),
            "ballot_commitment": ballot_commitment,
            "merkle_leaf": merkle_leaf,
            "status": "Pending Block Inclusion (Mempool)",
            "message": "Demo ballot recorded cryptographically. Retain your TxID for non-identifying verification."
        }

    def mine_pending_block(self, miner_label: str = "Demo-Node-KA-BLR-01") -> Dict[str, Any]:
        """
        Mines all pending mempool transactions into a new block.
        Calculates SHA-256 proof-of-work (difficulty '00').
        Updates confidential results tally from mined transactions.
        """
        if not self.mempool:
            # Create a heartbeat block or inform caller
            return {"success": False, "message": "No pending transactions in mempool to mine."}

        previous_block = self.chain[-1]
        previous_hash = previous_block["hash"]
        new_index = len(self.chain)
        iso_timestamp = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())

        # Extract public transactions and process private tallies
        public_transactions = []
        for itx in self.mempool:
            pub = {
                "tx_id": itx["tx_id"],
                "timestamp": itx["timestamp"],
                "constituency_code": itx["constituency_code"],
                "ballot_commitment": itx["ballot_commitment"],
                "merkle_leaf": itx["merkle_leaf"],
                "status": "confirmed",
                "block_index": new_index,
                "type": itx["type"]
            }
            public_transactions.append(pub)

            # Update private tally
            c_code = itx["constituency_code"]
            c_id = itx["_private_candidate_id"]
            if c_code not in self._tally_store:
                self._tally_store[c_code] = {}
            self._tally_store[c_code][c_id] = self._tally_store[c_code].get(c_id, 0) + 1

        tx_hashes = [tx["tx_id"] for tx in public_transactions]
        merkle_root = compute_merkle_root(tx_hashes)

        # Proof of work simulation
        nonce = 0
        difficulty_prefix = "00"
        block_hash = ""
        while True:
            candidate_str = f"{new_index}:{previous_hash}:{merkle_root}:{iso_timestamp}:{nonce}"
            h = sha256_hex(candidate_str)
            if h.startswith(difficulty_prefix):
                block_hash = h
                break
            nonce += 1
            if nonce > 200000:  # Safety fallback for fast demo response
                block_hash = "00" + h[2:]
                break

        new_block = {
            "index": new_index,
            "timestamp": iso_timestamp,
            "transactions": public_transactions,
            "merkle_root": merkle_root,
            "previous_hash": previous_hash,
            "nonce": nonce,
            "difficulty": difficulty_prefix,
            "miner": miner_label,
            "hash": block_hash
        }

        self.chain.append(new_block)
        mined_count = len(self.mempool)
        self.mempool = []

        return {
            "success": True,
            "block": new_block,
            "mined_transactions_count": mined_count,
            "message": f"Block #{new_index} successfully mined with {mined_count} verified transaction(s)."
        }

    def get_public_chain(self) -> List[Dict[str, Any]]:
        return self.chain

    def get_public_mempool(self) -> List[Dict[str, Any]]:
        # Return sanitized public representation of pending txs
        res = []
        for itx in self.mempool:
            res.append({
                "tx_id": itx["tx_id"],
                "timestamp": itx["timestamp"],
                "constituency_code": itx["constituency_code"],
                "ballot_commitment": itx["ballot_commitment"],
                "merkle_leaf": itx["merkle_leaf"],
                "status": "pending_mempool",
                "block_index": None,
                "type": itx["type"]
            })
        return res

    def get_transaction(self, tx_id: str) -> Optional[Dict[str, Any]]:
        # Search confirmed blocks
        for block in self.chain:
            for tx in block["transactions"]:
                if tx["tx_id"].lower() == tx_id.lower():
                    return {**tx, "block_hash": block["hash"], "confirmed": True}
        # Search mempool
        for tx in self.get_public_mempool():
            if tx["tx_id"].lower() == tx_id.lower():
                return {**tx, "block_hash": None, "confirmed": False}
        return None

    def get_aggregated_results(self, constituency_code: Optional[str] = None) -> Dict[str, Any]:
        """
        Returns vote counts aggregated ONLY from confirmed blocks.
        Preserves ballot secrecy during voting, matching standard counting protocol.
        """
        results_by_constituency = {}
        for c_code, c_data in CONSTITUENCIES.items():
            if constituency_code and c_code != constituency_code:
                continue
            c_tallies = self._tally_store.get(c_code, {})
            candidate_list = []
            total_simulated_votes = sum(c_tallies.values())
            for cand in c_data["candidates"]:
                sim_count = c_tallies.get(cand["id"], 0)
                sim_share = f"{(sim_count / total_simulated_votes * 100):.2f}%" if total_simulated_votes > 0 else "0.00%"
                candidate_list.append({
                    "id": cand["id"],
                    "serial_no": cand["serial_no"],
                    "name_en": cand.get("name_en", cand.get("name", "")),
                    "name_kn": cand.get("name_kn", cand.get("kannada_name", "")),
                    "party_code": cand["party_code"],
                    "party_name_en": cand.get("party_name_en", cand.get("party_name", "")),
                    "party_name_kn": cand.get("party_name_kn", cand.get("party_kannada", "")),
                    "symbol_name_en": cand.get("symbol_name_en", cand.get("symbol_name", "")),
                    "symbol_name_kn": cand.get("symbol_name_kn", ""),
                    "symbol_status": cand.get("symbol_status", "neutral_fallback"),
                    "symbol_url": cand.get("symbol_url", ""),
                    "simulated_votes": sim_count,
                    "simulated_vote_share": sim_share,
                    "official_historical_votes": cand.get("votes_secured_official", 0),
                    "official_historical_share": cand.get("vote_share_official", "0%"),
                    "official_result_en": cand.get("official_result_en", cand.get("official_result", "")),
                    "official_result_kn": cand.get("official_result_kn", "")
                })
            results_by_constituency[c_code] = {
                "constituency_code": c_code,
                "constituency_name_en": c_data.get("name_en", c_data.get("name", "")),
                "constituency_name_kn": c_data.get("name_kn", ""),
                "total_simulated_votes": total_simulated_votes,
                "candidates": candidate_list
            }
        return results_by_constituency

    def reset_demo_session(self):
        """Resets the demo ledger to initial state."""
        self.chain = []
        self.mempool = []
        self._session_secret = secrets.token_hex(16)
        self._spent_nullifiers.clear()
        self._tally_store.clear()
        self._create_genesis_block()
        return {"success": True, "message": "Demo ledger and session reset to Genesis state."}

# Global singleton
blockchain = TransparentVotingBlockchain()