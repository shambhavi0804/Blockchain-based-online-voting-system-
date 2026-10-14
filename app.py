from flask import Flask, render_template, request, jsonify
from datetime import datetime
from blockchain import blockchain, TransparentVotingBlockchain
from election_data import (
    ELECTION_METADATA,
    VOTING_WINDOW,
    VOTING_PRECAUTIONS,
    CONSTITUENCIES,
    POLITICAL_PARTIES,
    DEMO_VOTER_IDS,
    IST
)

app = Flask(__name__, template_folder='Templates', static_folder='static')

# Compatibility alias
Blockchain = TransparentVotingBlockchain

# Developer override for live demo testing
DEMO_STATE_OVERRIDE = None

def get_current_window_state():
    global DEMO_STATE_OVERRIDE
    if DEMO_STATE_OVERRIDE in ["open", "upcoming", "closed"]:
        return DEMO_STATE_OVERRIDE

    try:
        now_ist = datetime.now(IST)
        starts = datetime.fromisoformat(VOTING_WINDOW["starts_at"])
        ends = datetime.fromisoformat(VOTING_WINDOW["ends_at"])
        if now_ist < starts:
            return "upcoming"
        elif now_ist > ends:
            return "closed"
        else:
            return "open"
    except Exception:
        return "open"

@app.route('/')
def index():
    return render_template(
        'index.html',
        election_meta=ELECTION_METADATA,
        voting_window=VOTING_WINDOW,
        voting_precautions=VOTING_PRECAUTIONS,
        constituencies=CONSTITUENCIES,
        parties=POLITICAL_PARTIES,
        demo_voters=DEMO_VOTER_IDS,
        window_state=get_current_window_state()
    )

# --- RESTful Civic-Tech APIs ---

@app.route('/api/election-info', methods=['GET'])
def api_election_info():
    state = get_current_window_state()
    return jsonify({
        "status": "success",
        "election": ELECTION_METADATA,
        "voting_window": VOTING_WINDOW,
        "voting_precautions": VOTING_PRECAUTIONS,
        "current_window_state": state,
        "current_time_ist": datetime.now(IST).isoformat()
    })

@app.route('/api/voting-window/override', methods=['POST'])
def api_voting_window_override():
    global DEMO_STATE_OVERRIDE
    data = request.get_json(silent=True) or {}
    override_val = data.get('state')  # 'open', 'upcoming', 'closed', or 'reset'
    if override_val in ['open', 'upcoming', 'closed']:
        DEMO_STATE_OVERRIDE = override_val
    else:
        DEMO_STATE_OVERRIDE = None

    return jsonify({
        "status": "success",
        "current_window_state": get_current_window_state(),
        "message": f"Voting window state set to {get_current_window_state()}."
    })

@app.route('/api/constituencies', methods=['GET'])
def api_constituencies():
    summary_list = [
        {
            "code": c["code"],
            "name_en": c["name_en"],
            "name_kn": c["name_kn"],
            "district_en": c["district_en"],
            "district_kn": c["district_kn"],
            "parliamentary_constituency_en": c["parliamentary_constituency_en"],
            "parliamentary_constituency_kn": c["parliamentary_constituency_kn"],
            "total_electors": c["total_electors"],
            "total_polled": c["total_polled"],
            "turnout_percent": c["turnout_percent"],
            "candidate_count": len(c["candidates"])
        }
        for c in CONSTITUENCIES.values()
    ]
    return jsonify({
        "status": "success",
        "constituencies": summary_list
    })

@app.route('/api/constituency/<code_or_id>', methods=['GET'])
def api_constituency_detail(code_or_id):
    c_data = CONSTITUENCIES.get(str(code_or_id).strip())
    if not c_data:
        return jsonify({"status": "error", "message": f"Constituency '{code_or_id}' not found in sourced dataset."}), 404
    return jsonify({
        "status": "success",
        "constituency": c_data
    })

@app.route('/api/parties', methods=['GET'])
def api_parties():
    constituency_code = request.args.get('constituency')
    parties_data = []

    contesting_party_codes = set()
    if constituency_code and constituency_code in CONSTITUENCIES:
        for cand in CONSTITUENCIES[constituency_code]["candidates"]:
            contesting_party_codes.add(cand["party_code"])

    for party in POLITICAL_PARTIES:
        p_dict = dict(party)
        if constituency_code:
            p_dict["is_contesting_in_selected_constituency"] = party["code"] in contesting_party_codes
        parties_data.append(p_dict)

    return jsonify({
        "status": "success",
        "parties": parties_data,
        "total_parties": len(parties_data)
    })

@app.route('/api/demo-voters', methods=['GET'])
def api_demo_voters():
    tokens_status = []
    for item in DEMO_VOTER_IDS:
        tok = item["token"]
        has_voted = blockchain.has_voted(tok)
        tokens_status.append({
            "token": tok,
            "label_kn": item["label_kn"],
            "label_en": item["label_en"],
            "has_voted": has_voted,
            "status_kn": "ಈ ಅಧಿವೇಶನದಲ್ಲಿ ಮತ ಚಲಾಯಿಸಲಾಗಿದೆ" if has_voted else "ಲಭ್ಯವಿರುವ ಡೆಮೊ ಟೋಕನ್",
            "status_en": "Ballot Cast (This Session)" if has_voted else "Available Demo Token"
        })
    return jsonify({
        "status": "success",
        "voters": tokens_status
    })

@app.route('/api/verify-voter', methods=['POST'])
def api_verify_voter():
    data = request.get_json(silent=True) or request.form
    voter_token = data.get('voter_token') or data.get('voter')

    if not voter_token:
        return jsonify({
            "status": "error",
            "message_kn": "ದಯವಿಟ್ಟು ಡೆಮೊ ಟೋಕನ್ ನಮೂದಿಸಿ.",
            "message_en": "Voter demo token is required.",
            "message": "Voter demo token is required."
        }), 400

    token_clean = voter_token.strip().upper()
    is_valid = blockchain.is_valid_demo_voter(token_clean)
    if not is_valid:
        return jsonify({
            "status": "error",
            "is_valid": False,
            "message_kn": f"'{token_clean}' ಮಾನ್ಯತೆ ಪಡೆದ ಡೆಮೊ ಟೋಕನ್ ಅಲ್ಲ. KA-DEMO-1001 ಬಳಸಿ.",
            "message_en": f"'{token_clean}' is not an authorized demo token. Use a synthetic token like KA-DEMO-1001.",
            "message": f"'{token_clean}' is not an authorized demo token."
        }), 400

    has_voted = blockchain.has_voted(token_clean)
    return jsonify({
        "status": "success",
        "is_valid": True,
        "has_voted": has_voted,
        "token": token_clean,
        "message_kn": "ಈ ಡೆಮೊ ಟೋಕನ್ ಮೂಲಕ ಈಗಾಗಲೇ ಮತ ಚಲಾಯಿಸಲಾಗಿದೆ." if has_voted else "ಡೆಮೊ ಟೋಕನ್ ಪರಿಶೀಲಿಸಲಾಗಿದೆ ಮತ್ತು ಅರ್ಹವಾಗಿದೆ.",
        "message_en": "Demo token already submitted in this session." if has_voted else "Demo token valid and eligible to vote.",
        "message": "Demo token already submitted in this session." if has_voted else "Demo token valid and eligible to vote."
    })

@app.route('/api/vote', methods=['POST'])
def api_vote():
    # Enforce voting window state rule
    window_state = get_current_window_state()
    if window_state != "open":
        msg_kn = "ಮತದಾನದ ಅವಧಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ಮತ ಚಲಾವಣೆ ಅಸಾಧ್ಯ." if window_state == "closed" else "ಮತದಾನದ ಅವಧಿ ಇನ್ನೂ ಪ್ರಾರಂಭವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ."
        msg_en = f"Voting window is {window_state.upper()}. Ballot submission is currently disabled."
        return jsonify({
            "status": "error",
            "window_state": window_state,
            "message_kn": msg_kn,
            "message_en": msg_en,
            "message": f"{msg_kn} ({msg_en})"
        }), 403

    data = request.get_json(silent=True) or request.form
    voter_token = data.get('voter_token') or data.get('voter')
    constituency_code = data.get('constituency_code') or data.get('constituency') or "160"
    candidate_id = data.get('candidate_id') or data.get('candidate')

    if not voter_token or not candidate_id:
        return jsonify({
            "status": "error",
            "message_kn": "ಮತದಾರರ ಡೆಮೊ ಟೋಕನ್ ಮತ್ತು ಅಭ್ಯರ್ಥಿ ಆಯ್ಕೆ ಎರಡೂ ಅಗತ್ಯವಿದೆ.",
            "message_en": "Both voter demo token and candidate selection are required.",
            "message": "Both voter demo token and candidate selection are required."
        }), 400

    try:
        receipt = blockchain.add_ballot(voter_token, constituency_code, candidate_id)
        return jsonify({
            "status": "success",
            "receipt": receipt
        })
    except ValueError as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 400

@app.route('/api/mine', methods=['POST', 'GET'])
def api_mine():
    result = blockchain.mine_pending_block()
    if not result.get("success"):
        return jsonify({
            "status": "info",
            "message_kn": "ಗಣಿಗಾರಿಕೆ ಮಾಡಲು ಯಾವುದೇ ಬಾಕಿ ಇರುವ ವಹಿವಾಟುಗಳಿಲ್ಲ.",
            "message_en": "No pending transactions in mempool to mine.",
            "message": result.get("message", "No transactions in mempool to mine.")
        }), 200
    return jsonify({
        "status": "success",
        "data": result
    })

@app.route('/api/blocks', methods=['GET'])
def api_blocks():
    return jsonify({
        "status": "success",
        "chain": blockchain.get_public_chain(),
        "block_count": len(blockchain.chain),
        "mempool": blockchain.get_public_mempool(),
        "mempool_count": len(blockchain.mempool)
    })

@app.route('/api/tx/<tx_id>', methods=['GET'])
def api_transaction_detail(tx_id):
    tx = blockchain.get_transaction(tx_id)
    if not tx:
        return jsonify({"status": "error", "message": f"Transaction '{tx_id}' not found."}), 404
    return jsonify({
        "status": "success",
        "transaction": tx
    })

@app.route('/api/results', methods=['GET'])
def api_results():
    constituency_code = request.args.get('constituency')
    tallies = blockchain.get_aggregated_results(constituency_code)
    return jsonify({
        "status": "success",
        "results": tallies
    })

@app.route('/api/reset-demo', methods=['POST'])
def api_reset_demo():
    result = blockchain.reset_demo_session()
    return jsonify({
        "status": "success",
        "message": result["message"]
    })

# --- Legacy Route Wrappers (Backward compatibility) ---

@app.route('/vote', methods=['POST'])
def legacy_vote():
    voter = request.form.get('voter', '')
    candidate = request.form.get('candidate', '')
    constituency = request.form.get('constituency', '160')

    cand_id = None
    if constituency in CONSTITUENCIES:
        for c in CONSTITUENCIES[constituency]["candidates"]:
            if c["id"] == candidate or c["party_code"].lower() == candidate.lower() or c["name_en"].lower() == candidate.lower() or c["name_kn"].lower() == candidate.lower():
                cand_id = c["id"]
                break

    if not cand_id and constituency in CONSTITUENCIES:
        cand_id = CONSTITUENCIES[constituency]["candidates"][0]["id"]

    try:
        receipt = blockchain.add_ballot(voter, constituency, cand_id)
        return render_template('success.html', voter=voter, candidate=candidate, receipt=receipt)
    except ValueError as e:
        msg = str(e).lower()
        if "already" in msg:
            return render_template('already_voted.html', voter=voter)
        else:
            return render_template('invalid.html', voter=voter)

@app.route('/mine')
def legacy_mine():
    blockchain.mine_pending_block()
    return "Block Mined Successfully!"

@app.route('/results')
def legacy_results():
    tallies = blockchain.get_aggregated_results()
    simple_tally = {}
    for c_code, c_data in tallies.items():
        for cand in c_data["candidates"]:
            simple_tally[f"{cand['party_code']} ({cand['name']})"] = cand["simulated_votes"]
    return jsonify(simple_tally)

@app.route('/chain')
def legacy_chain():
    return jsonify(blockchain.get_public_chain())

if __name__ == '__main__':
    app.run(debug=True, port=5000)