/**
 * Karnataka Legislative Assembly Blockchain Voting Demo
 * Client-Side Application Controller: Kannada-First, Live IST Timer, Bilingual Dictionary
 */

// Global Application State
const AppState = {
  lang: 'kn', // Default language: Kannada
  currentView: 'overview',
  activeConstituencyCode: '160',
  constituencyData: null,
  allConstituencies: [],
  selectedCandidateId: null,
  voterToken: '',
  voterVerified: false,
  voterHasVoted: false,
  latestReceipt: null,
  parties: [],
  blocks: [],
  mempool: [],
  results: null,
  votingWindow: null,
  windowState: 'open', // 'open' | 'upcoming' | 'closed'
  timerInterval: null,
  lastAnnouncedState: null
};

// Comprehensive Bilingual Translation Dictionary
const I18N = {
  kn: {
    app_title: "ಕರ್ನಾಟಕ ವಿಧಾನಸಭಾ ಚುನಾವಣೆ ಡೆಮೊ",
    app_subtitle: "ಸಿಮ್ಯುಲೇಟೆಡ್ ೧೬ನೇ ವಿಧಾನಸಭೆ • ಅಧಿಕೃತ ಇಸಿಐ ದತ್ತಾಂಶ",
    demo_badge: "ಶೈಕ್ಷಣಿಕ ಡೆಮೊ",
    constituency_label: "ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ:",
    data_verified_chip: "ಇಸಿಐ ದಾಖಲೆಗಳು • ಅಕ್ಟೋಬರ್ ೨೦೨೪ ಪರಿಶೀಲನೆ",
    ledger_chip_synced: "ಲೆಡ್ಜರ್: ಸಿಂಕ್ ಆಗಿದೆ",
    btn_precautions: "⚠️ ಮತದಾನದ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು",
    
    // Tabs
    tab_overview: "ಮುನ್ನೋಟ",
    tab_ballot: "ಅಧಿಕೃತ ಮತಪತ್ರ",
    tab_receipt: "ಮತದಾನ ರಶೀದಿ",
    tab_directory: "ರಾಜಕೀಯ ಪಕ್ಷಗಳ ಕೋಶ",
    tab_ledger: "ಲೆಡ್ಜರ್ ಅನ್ವೇಷಕ",
    tab_limitations: "ಗೌಪ್ಯತೆ ಮತ್ತು ಮಿತಿಗಳು",

    // Sidebar footer
    sidebar_notice_title: "ನಾಗರಿಕ ಗಡಿರೇಖೆಯ ಸೂಚನೆ",
    sidebar_notice_text: "ಇದು ಶೈಕ್ಷಣಿಕ ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ಮಾತ್ರ. ನೈಜ ಚುನಾವಣಾ ಗುರುತಿನ ಚೀಟಿ ಅಥವಾ ವೈಯಕ್ತಿಕ ವಿವರಗಳನ್ನು ಎಂದಿಗೂ ನಮೂದಿಸಬೇಡಿ.",
    btn_reset_session: "ಡೆಮೊ ಅಧಿವೇಶನ ಮರುಹೊಂದಿಸಿ",

    // Voting Window
    window_panel_title: "ಮತದಾನದ ಅವಧಿ ಮತ್ತು ಸಮಯ",
    state_open: "ತೆರೆದಿದೆ (OPEN)",
    state_upcoming: "ಮುಂಬರುವ (UPCOMING)",
    state_closed: "ಮುಕ್ತಾಯಗೊಂಡಿದೆ (CLOSED)",
    window_open_msg: "ಮತದಾನ ಪ್ರಕ್ರಿಯೆ ಪ್ರಸ್ತುತ ತೆರೆದಿದೆ. ಮತಪತ್ರದಲ್ಲಿ ನಿಮ್ಮ ಆಯ್ಕೆಯನ್ನು ದಾಖಲಿಸಬಹುದು.",
    window_upcoming_msg: "ಮತದಾನದ ಅವಧಿ ಇನ್ನೂ ಪ್ರಾರಂಭವಾಗಿಲ್ಲ. ನಿಗದಿತ ಸಮಯಕ್ಕೆ ಮಾತ್ರ ಮತ ಚಲಾಯಿಸಲು ಸಾಧ್ಯ.",
    window_closed_msg: "ಮತದಾನದ ಗಡುವು ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ಹೊಸ ಮತಗಳನ್ನು ಸ್ವೀಕರಿಸಲಾಗುವುದಿಲ್ಲ.",
    timer_closes_in: "ಮುಕ್ತಾಯಕ್ಕೆ ಉಳಿದ ಸಮಯ:",
    timer_opens_in: "ಪ್ರಾರಂಭಕ್ಕೆ ಉಳಿದ ಸಮಯ:",
    timer_closed_label: "ಮತದಾನ ಮುಕ್ತಾಯಗೊಂಡಿದೆ",
    unit_days: "ದಿನ",
    unit_hours: "ಗಂಟೆ",
    unit_mins: "ನಿಮಿಷ",
    unit_secs: "ಸೆಕೆಂಡು",
    timezone_label: "ಭಾರತೀಯ ಪ್ರಮಾಣಿತ ಕಾಲಮಾನ (IST)",

    // Overview Hero
    hero_title: "ಕರ್ನಾಟಕ ೧೬ನೇ ವಿಧಾನಸಭಾ ಸಾರ್ವತ್ರಿಕ ಚುನಾವಣೆ ಡೆಮೊ",
    hero_sub: "ಭಾರತ ಚುನಾವಣಾ ಆಯೋಗ (ECI) ಮತ್ತು ಮುಖ್ಯ ಚುನಾವಣಾಧಿಕಾರಿ (CEO), ಕರ್ನಾಟಕ ಇವರ ಮೂಲ ದಾಖಲೆಗಳು",
    hero_demo_tag: "ಡೆಮೊ ಯೋಜನೆ — ಯಾವುದೇ ಪಕ್ಷಕ್ಕೆ ಸೀಮಿತವಿಲ್ಲದ ತಟಸ್ಥ ವೇದಿಕೆ",

    // Stats
    stat_constituency: "ಆಯ್ಕೆಯಾದ ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ",
    stat_electors: "ನೋಂದಾಯಿತ ಮತದಾರರು",
    stat_turnout: "ಮತದಾನ ಪ್ರಮಾಣ ಮತ್ತು ಚಲಾವಣೆ",
    stat_district: "ಜಿಲ್ಲೆ",

    // Framework
    framework_title: "ಚುನಾವಣಾ ಆಡಳಿತ ಚೌಕಟ್ಟು",
    authority_label: "ಸಂವಿಧಾನಬದ್ಧ ಪ್ರಾಧಿಕಾರ",
    authority_val: "ಭಾರತ ಚುನಾವಣಾ ಆಯೋಗ (ECI)",
    state_officer_label: "ರಾಜ್ಯ ಚುನಾವಣಾಧಿಕಾರಿ",
    state_officer_val: "ಮುಖ್ಯ ಚುನಾವಣಾಧಿಕಾರಿ (CEO), ಕರ್ನಾಟಕ",
    ro_label: "ಕ್ಷೇತ್ರ ಚುನಾವಣಾಧಿಕಾರಿ",
    voting_system_label: "ಭಾರತದ ಮತದಾನ ವಿಧಾನ",
    voting_system_val: "ಸ್ವತಂತ್ರ EVM + ಕಾಗದದ ಆಡಿಟ್ ಟ್ರಯಲ್ (VVPAT)",

    // Precautions
    precautions_main_title: "ಮತದಾನದ ಪ್ರಮುಖ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು (Voting Precautions)",
    precautions_main_sub: "ಡೆಮೊ ಮತದಾನ ಮಾಡುವ ಮುನ್ನ ಈ ಕೆಳಗಿನ ಮಾರ್ಗಸೂಚಿಗಳನ್ನು ತಪ್ಪದೇ ಗಮನಿಸಿ:",

    // Ballot
    ballot_title: "ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರದ ಸ್ಪರ್ಧಾತ್ಮಕ ಅಭ್ಯರ್ಥಿಗಳು",
    ballot_desc: "ಇಸಿಐ ನಮೂನೆ 7A ಅನ್ವಯ ಅಧಿಕೃತ ಅಭ್ಯರ್ಥಿಗಳ ಪಟ್ಟಿ, ಪಕ್ಷ ಮತ್ತು ಚಿಹ್ನೆಗಳು.",
    voter_step1: "ಹಂತ ೧: ಡೆಮೊ ಪರಿಶೀಲನಾ ಕೋಡ್ ಒದಗಿಸಿ",
    voter_input_ph: "ಡೆಮೊ ಕೋಡ್ ನಮೂದಿಸಿ (ಉದಾ: KA-DEMO-1001)",
    btn_verify: "ಟೋಕನ್ ಪರಿಶೀಲಿಸಿ",
    quick_tokens_label: "ಅಧಿಕೃತ ಡೆಮೊ ಟೋಕನ್ ಆಯ್ಕೆಮಾಡಿ:",
    ballot_search_ph: "ಅಭ್ಯರ್ಥಿ, ಪಕ್ಷ ಅಥವಾ ಚಿಹ್ನೆಯನ್ನು ಹುಡುಕಿ...",
    filter_all: "ಎಲ್ಲಾ ಅಭ್ಯರ್ಥಿಗಳು",
    filter_national: "ರಾಷ್ಟ್ರೀಯ ಪಕ್ಷಗಳು",
    filter_state: "ರಾಜ್ಯ ಪಕ್ಷಗಳು",
    filter_registered: "ನೋಂದಾಯಿತ / ಪಕ್ಷೇತರ",
    filter_nota: "ನೋಟಾ (NOTA)",
    th_sl: "ಕ್ರ.ಸಂ.",
    th_candidate: "ಅಭ್ಯರ್ಥಿಯ ಹೆಸರು (ಕನ್ನಡ / English)",
    th_party: "ಪಕ್ಷದ ವಿವರ ಮತ್ತು ಮಾನ್ಯತೆ",
    th_symbol: "ಅಧಿಕೃತ ಚಿಹ್ನೆ",
    th_select: "ಆಯ್ಕೆ",
    ballot_step2: "ಹಂತ ೨: ನಿಮ್ಮ ಆಯ್ಕೆ",
    no_cand_selected: "ಯಾವುದೇ ಅಭ್ಯರ್ಥಿ ಆಯ್ಕೆಯಾಗಿಲ್ಲ",
    btn_review: "ಆಯ್ಕೆ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸಲ್ಲಿಸಿ →",

    // Review Modal
    review_dialog_title: "ಮತದಾನದ ಆಯ್ಕೆ ಪರಿಶೀಲನೆ",
    review_dialog_intro: "ಸ್ಥಳೀಯ ಲೆಡ್ಜರ್‌ಗೆ ದಾಖಲಿಸುವ ಮೊದಲು ನಿಮ್ಮ ಆಯ್ಕೆಯನ್ನು ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ:",
    btn_edit_selection: "ಆಯ್ಕೆ ತಿದ್ದುಪಡಿ",
    btn_confirm_submit: "ಮತದಾನ ಖಚಿತಪಡಿಸಿ ಮತ್ತು ದಾಖಲಿಸಿ",

    // Receipt
    receipt_title: "ಸಿಮ್ಯುಲೇಶನ್ ಮತದಾನ ರಶೀದಿ",
    receipt_desc: "ಮತದಾರರ ಗುರುತು ಅಥವಾ ಆಯ್ಕೆಯನ್ನು ಬಹಿರಂಗಪಡಿಸದೆ ಮೆಂಪೂಲ್‌ಗೆ ಮತ ದಾಖಲಾದ ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ಪುರಾವೆ.",
    receipt_empty_title: "ಪ್ರಸ್ತುತ ಅಧಿವೇಶನದಲ್ಲಿ ಮತ ಚಲಾಯಿಸಲಾಗಿಲ್ಲ",
    receipt_empty_desc: "ಡೆಮೊ ರಶೀದಿಯನ್ನು ಪಡೆಯಲು ಅಧಿಕೃತ ಮತಪತ್ರದಲ್ಲಿ ಮತದಾನ ಪ್ರಕ್ರಿಯೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.",
    receipt_btn_to_ballot: "ಮತಪತ್ರಕ್ಕೆ ತೆರಳಿ",
    zk_why_title: "ರಶೀದಿಯಲ್ಲಿ ನಿಮ್ಮ ಅಭ್ಯರ್ಥಿಯ ಆಯ್ಕೆಯನ್ನು ಏಕೆ ಮರೆಮಾಡಲಾಗಿದೆ?",
    zk_why_desc: "ಪ್ರಜಾಪ್ರಭುತ್ವದ ರಹಸ್ಯ ಮತದಾನದ ತತ್ವವನ್ನು ರಕ್ಷಿಸಲು, ಸಾರ್ವಜನಿಕ ರಶೀದಿಯಲ್ಲಿ ಅಭ್ಯರ್ಥಿಯ ಆಯ್ಕೆ ಅಥವಾ ಮತದಾರರ ಗುರುತನ್ನು ಎಂದಿಗೂ ತೋರಿಸಲಾಗುವುದಿಲ್ಲ. ಇಲ್ಲದಿದ್ದರೆ ಮತದಾರರನ್ನು ಬೆದರಿಸುವ ಅಥವಾ ಮತ-ಖರೀದಿಸುವ ಅಪಾಯವಿರುತ್ತದೆ.",

    // Directory
    dir_title: "ಮಾನ್ಯತೆ ಪಡೆದ ರಾಜಕೀಯ ಪಕ್ಷಗಳ ಕೋಶ",
    dir_desc: "ಪ್ರಜಾಪ್ರಾತಿನಿಧ್ಯ ಕಾಯ್ದೆ 1951 ರ ಸೆಕ್ಷನ್ 29A ಅಡಿಯಲ್ಲಿ ನೋಂದಾಯಿತ ಪಕ್ಷಗಳು.",
    dir_search_ph: "ಪಕ್ಷದ ಹೆಸರು ಅಥವಾ ಸಂಕ್ಷಿಪ್ತ ರೂಪವನ್ನು ಹುಡುಕಿ...",

    // Ledger
    ledger_title: "ಪಾರದರ್ಶಕ ಮಾದರಿ ಬ್ಲಾಕ್‌ಚೈನ್ ಲೆಡ್ಜರ್",
    ledger_desc: "ಖಚಿತಪಡಿಸಿದ ಬ್ಲಾಕ್‌ಗಳು, ಹಿಂದಿನ ಹ್ಯಾಶ್‌ಗಳು, ಮರ್ಕಲ್ ರೂಟ್ ಮತ್ತು ಅನಾಮಧೇಯ ವಹಿವಾಟುಗಳನ್ನು ವೀಕ್ಷಿಸಿ.",
    stat_chain_height: "ಬ್ಲಾಕ್ ಎತ್ತರ",
    stat_mempool: "ಮೆಂಪೂಲ್ ಬಾಕಿ",
    stat_difficulty: "ಮೈನಿಂಗ್ ಕಷ್ಟತೆ",
    btn_mine: "⛏️ ಬಾಕಿ ಇರುವ ಬ್ಲಾಕ್ ಮೈನ್ ಮಾಡಿ",
    results_tally_title: "ಖಚಿತಪಡಿಸಿದ ಬ್ಲಾಕ್‌ಗಳ ಒಟ್ಟು ಫಲಿತಾಂಶಗಳು",

    // Limitations
    limits_title: "ಬ್ಲಾಕ್‌ಚೈನ್ ತಂತ್ರಜ್ಞಾನವು ಆನ್‌ಲೈನ್ ಮತದಾನವನ್ನು ಏಕೆ ಸಿದ್ಧಪಡಿಸುವುದಿಲ್ಲ?",
    limits_desc: "ರಿಮೋಟ್ ಡಿಜಿಟಲ್ ಮತದಾನದಲ್ಲಿನ ಕಂಪ್ಯೂಟರ್ ಭದ್ರತೆ, ಸಾಧನದ ದೋಷಗಳು ಮತ್ತು ಪ್ರಜಾಪ್ರಭುತ್ವದ ಮಿತಿಗಳ ವಿಶ್ಲೇಷಣೆ."
  },
  en: {
    app_title: "Karnataka Assembly Election Demo",
    app_subtitle: "Simulated 16th Vidhana Sabha • Sourced ECI Dataset",
    demo_badge: "Educational Demo",
    constituency_label: "Constituency:",
    data_verified_chip: "ECI Sourced • Oct 2024 Audit",
    ledger_chip_synced: "Ledger: Synced",
    btn_precautions: "⚠️ Voting Precautions",
    
    // Tabs
    tab_overview: "Overview",
    tab_ballot: "Official Ballot",
    tab_receipt: "Vote Receipt",
    tab_directory: "Party Directory",
    tab_ledger: "Ledger Explorer",
    tab_limitations: "Privacy & Limits",

    // Sidebar footer
    sidebar_notice_title: "Civic Boundary Notice",
    sidebar_notice_text: "Educational simulation only. Not affiliated with ECI or Govt of Karnataka. Never enter real personal credentials.",
    btn_reset_session: "Reset Demo Session",

    // Voting Window
    window_panel_title: "Voting Window & Time",
    state_open: "OPEN",
    state_upcoming: "UPCOMING",
    state_closed: "CLOSED",
    window_open_msg: "Voting is currently open. You may select a candidate and cast your simulated ballot.",
    window_upcoming_msg: "Voting is not yet open. Ballot submission will be enabled at the scheduled opening time.",
    window_closed_msg: "Voting window has closed. No further ballots can be recorded in this session.",
    timer_closes_in: "Time remaining to close:",
    timer_opens_in: "Time remaining to open:",
    timer_closed_label: "Voting window closed",
    unit_days: "Days",
    unit_hours: "Hours",
    unit_mins: "Mins",
    unit_secs: "Secs",
    timezone_label: "India Standard Time (IST)",

    // Overview Hero
    hero_title: "Karnataka 16th Legislative Assembly General Election Demo",
    hero_sub: "Primary-source electoral records sourced from Election Commission of India (ECI) & CEO Karnataka",
    hero_demo_tag: "Educational Prototype — Neutral Civic-Tech Simulator",

    // Stats
    stat_constituency: "Selected Assembly Seat",
    stat_electors: "Registered Electors",
    stat_turnout: "Turnout & Polled Votes",
    stat_district: "District",

    // Framework
    framework_title: "Electoral Governance Framework",
    authority_label: "Statutory Authority",
    authority_val: "Election Commission of India (ECI)",
    state_officer_label: "State Electoral Officer",
    state_officer_val: "Chief Electoral Officer (CEO), Karnataka",
    ro_label: "Returning Officer",
    voting_system_label: "Voting System in India",
    voting_system_val: "Standalone EVM + Paper Audit Trail (VVPAT)",

    // Precautions
    precautions_main_title: "Important Voting Precautions",
    precautions_main_sub: "Review these security and civic guidelines before recording a simulated ballot:",

    // Ballot
    ballot_title: "Constituency Contesting Candidates",
    ballot_desc: "Candidate names, serial order, and party designations reflect verified records from ECI Form 7A.",
    voter_step1: "Step 1: Provide Simulation Demo Token",
    voter_input_ph: "Enter Demo Token (e.g. KA-DEMO-1001)",
    btn_verify: "Verify Demo Token",
    quick_tokens_label: "Select authorized demo token:",
    ballot_search_ph: "Search candidate by name, party, or Kannada script...",
    filter_all: "All Contenders",
    filter_national: "National Parties",
    filter_state: "State Parties",
    filter_registered: "Registered / Ind",
    filter_nota: "NOTA",
    th_sl: "Sl. No.",
    th_candidate: "Candidate Name (English / Kannada)",
    th_party: "Party Affiliation & Status",
    th_symbol: "Official Symbol",
    th_select: "Selection",
    ballot_step2: "Step 2: Candidate Choice",
    no_cand_selected: "No candidate selected",
    btn_review: "Review Selection & Submit →",

    // Review Modal
    review_dialog_title: "Review Ballot Selection",
    review_dialog_intro: "Please verify your candidate selection before committing to the mock ledger:",
    btn_edit_selection: "Edit Selection",
    btn_confirm_submit: "Confirm & Record Vote",

    // Receipt
    receipt_title: "Simulation Vote Receipt",
    receipt_desc: "Non-identifying cryptographic proof that a ballot was recorded without exposing voter identity or choice.",
    receipt_empty_title: "No Ballot Cast in Current Session",
    receipt_empty_desc: "Complete the candidate selection on the Official Ballot tab to generate a simulated receipt.",
    receipt_btn_to_ballot: "Go to Official Ballot",
    zk_why_title: "Why does this receipt withhold your candidate selection?",
    zk_why_desc: "To uphold ballot secrecy, public receipts must never display vote choice or voter identity. Otherwise, voters could be coerced or incentivized to sell their votes by presenting their receipt.",

    // Directory
    dir_title: "Verified Political Party Directory",
    dir_desc: "All parties registered under Section 29A of the Representation of the People Act, 1951.",
    dir_search_ph: "Search by party name, abbreviation (BJP, INC...), or Kannada script...",

    // Ledger
    ledger_title: "Transparent Mock Blockchain Explorer",
    ledger_desc: "Inspect confirmed blocks, previous hashes, Merkle root calculations, and anonymized mempool transactions.",
    stat_chain_height: "Chain Height",
    stat_mempool: "Mempool Pending",
    stat_difficulty: "Mining Difficulty",
    btn_mine: "⛏️ Mine Pending Block",
    results_tally_title: "Aggregated Results from Mined Blocks",

    // Limitations
    limits_title: "Why Blockchain Does Not Make Online Voting Election-Ready",
    limits_desc: "An overview of cryptographic, device-level security, and democratic trade-offs in remote digital voting."
  }
};

// DOM References
const DOM = {
  constituencySelect: document.getElementById('constituency-select'),
  navLinks: document.querySelectorAll('.sidebar-nav-link'),
  views: document.querySelectorAll('.view-container'),
  langBtnKn: document.getElementById('lang-btn-kn'),
  langBtnEn: document.getElementById('lang-btn-en'),

  // Voting window elements
  votingWindowPanel: document.getElementById('voting-window-panel'),
  windowStateBadge: document.getElementById('window-state-badge'),
  windowStateMsg: document.getElementById('window-state-msg'),
  windowDatesDisplay: document.getElementById('window-dates-display'),
  windowTimerLabel: document.getElementById('window-timer-label'),
  timerDays: document.getElementById('timer-days'),
  timerHours: document.getElementById('timer-hours'),
  timerMins: document.getElementById('timer-mins'),
  timerSecs: document.getElementById('timer-secs'),
  timerAriaAnnouncement: document.getElementById('timer-aria-announcement'),
  devStateBtns: document.querySelectorAll('.btn-state-pill'),

  // Voter Auth
  voterTokenInput: document.getElementById('voter-token-input'),
  btnVerifyVoter: document.getElementById('btn-verify-voter'),
  voterFeedback: document.getElementById('voter-status-feedback'),
  quickTokenPills: document.querySelectorAll('.quick-token-pill'),

  // Precautions
  precautionsGrid: document.getElementById('precautions-list-grid'),
  btnOpenPrecautions: document.getElementById('btn-open-precautions'),

  // Ballot
  ballotSearchInput: document.getElementById('ballot-search-input'),
  ballotFilterBtns: document.querySelectorAll('.ballot-filter-btn'),
  candidateRosterBody: document.getElementById('candidate-roster-body'),
  selectedCandidateDisplay: document.getElementById('selected-candidate-display'),
  btnReviewSelection: document.getElementById('btn-review-selection'),

  // Review Modal
  reviewDialog: document.getElementById('review-selection-dialog'),
  reviewSummaryDetails: document.getElementById('review-summary-details'),
  btnConfirmVote: document.getElementById('btn-confirm-vote'),
  btnCancelReview: document.getElementById('btn-cancel-review'),

  // Receipt
  receiptContainer: document.getElementById('receipt-container'),
  receiptEmptyState: document.getElementById('receipt-empty-state'),

  // Parties Directory
  partySearchInput: document.getElementById('party-search-input'),
  partyFilterBtns: document.querySelectorAll('.party-filter-btn'),
  partyGridContainer: document.getElementById('party-grid-container'),

  // Ledger
  blocksContainer: document.getElementById('blocks-container'),
  mempoolBadge: document.getElementById('mempool-badge'),
  btnMineBlock: document.getElementById('btn-mine-block'),
  resultsContainer: document.getElementById('results-tally-container'),

  // Session Reset
  btnResetSession: document.getElementById('btn-reset-session'),
  disclaimerDialog: document.getElementById('disclaimer-dialog'),
  btnOpenDisclaimer: document.getElementById('btn-open-disclaimer'),
  btnCloseDisclaimer: document.getElementById('btn-close-disclaimer')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  loadElectionData();
  switchView('overview');
});

function initEventListeners() {
  // Language Switcher
  if (DOM.langBtnKn && DOM.langBtnEn) {
    DOM.langBtnKn.addEventListener('click', () => setLanguage('kn'));
    DOM.langBtnEn.addEventListener('click', () => setLanguage('en'));
  }

  // Navigation tabs
  DOM.navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = link.getAttribute('data-view');
      switchView(targetView);
    });
  });

  // Constituency switcher
  if (DOM.constituencySelect) {
    DOM.constituencySelect.addEventListener('change', (e) => {
      AppState.activeConstituencyCode = e.target.value;
      AppState.selectedCandidateId = null;
      updateBallotSelectionUI();
      loadConstituencyDetail(AppState.activeConstituencyCode);
      loadParties();
      loadLedgerResults();
    });
  }

  // Voter verification
  if (DOM.btnVerifyVoter) {
    DOM.btnVerifyVoter.addEventListener('click', handleVerifyVoter);
  }
  if (DOM.voterTokenInput) {
    DOM.voterTokenInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleVerifyVoter();
    });
    DOM.voterTokenInput.addEventListener('input', () => {
      AppState.voterToken = DOM.voterTokenInput.value.trim().toUpperCase();
      AppState.voterVerified = false;
      DOM.voterFeedback.className = 'voter-status-feedback';
      DOM.voterFeedback.textContent = '';
      updateBallotSelectionUI();
    });
  }

  // Quick token pills
  DOM.quickTokenPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const token = pill.getAttribute('data-token');
      DOM.voterTokenInput.value = token;
      AppState.voterToken = token;
      handleVerifyVoter();
    });
  });

  // Ballot search and filters
  if (DOM.ballotSearchInput) {
    DOM.ballotSearchInput.addEventListener('input', renderCandidateRoster);
  }
  DOM.ballotFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.ballotFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCandidateRoster();
    });
  });

  // Review & Submit
  if (DOM.btnReviewSelection) {
    DOM.btnReviewSelection.addEventListener('click', openReviewDialog);
  }
  if (DOM.btnCancelReview) {
    DOM.btnCancelReview.addEventListener('click', () => DOM.reviewDialog.close());
  }
  if (DOM.btnConfirmVote) {
    DOM.btnConfirmVote.addEventListener('click', handleSubmitBallot);
  }

  // Party directory search & filters
  if (DOM.partySearchInput) {
    DOM.partySearchInput.addEventListener('input', renderPartyDirectory);
  }
  DOM.partyFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.partyFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPartyDirectory();
    });
  });

  // Mining
  if (DOM.btnMineBlock) {
    DOM.btnMineBlock.addEventListener('click', handleMineBlock);
  }

  // Precautions modal/anchor button
  if (DOM.btnOpenPrecautions) {
    DOM.btnOpenPrecautions.addEventListener('click', () => {
      switchView('ballot');
      const pBox = document.getElementById('precautions-panel');
      if (pBox) pBox.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Disclaimers dialog
  if (DOM.btnOpenDisclaimer) {
    DOM.btnOpenDisclaimer.addEventListener('click', () => DOM.disclaimerDialog.showModal());
  }
  if (DOM.btnCloseDisclaimer) {
    DOM.btnCloseDisclaimer.addEventListener('click', () => DOM.disclaimerDialog.close());
  }

  // Reset Session
  if (DOM.btnResetSession) {
    DOM.btnResetSession.addEventListener('click', handleResetSession);
  }

  // Developer state switcher pills
  DOM.devStateBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const stateVal = btn.getAttribute('data-state');
      try {
        await fetch('/api/voting-window/override', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: stateVal })
        });
        await loadElectionData();
      } catch (err) {
        console.error('Error setting window state:', err);
      }
    });
  });
}

// Language Controller
function setLanguage(lang) {
  AppState.lang = lang;
  if (lang === 'kn') {
    DOM.langBtnKn.classList.add('active');
    DOM.langBtnEn.classList.remove('active');
    document.documentElement.lang = 'kn';
  } else {
    DOM.langBtnEn.classList.add('active');
    DOM.langBtnKn.classList.remove('active');
    document.documentElement.lang = 'en';
  }

  translateStaticElements();
  if (AppState.constituencyData) {
    updateOverviewScreen(AppState.constituencyData);
    renderCandidateRoster();
  }
  renderPartyDirectory();
  renderPrecautionsList();
  if (AppState.latestReceipt) {
    renderReceipt(AppState.latestReceipt);
  }
  if (AppState.results && AppState.results[AppState.activeConstituencyCode]) {
    renderResultsTally(AppState.results[AppState.activeConstituencyCode]);
  }
  updateBallotSelectionUI();
  updateVotingWindowUI();
}

function t(key) {
  const dict = I18N[AppState.lang] || I18N.kn;
  return dict[key] || I18N.en[key] || key;
}

function translateStaticElements() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    el.setAttribute('placeholder', t(key));
  });
}

// View Switcher
function switchView(viewId) {
  AppState.currentView = viewId;
  DOM.views.forEach(v => {
    if (v.id === `view-${viewId}`) {
      v.classList.add('active-view');
    } else {
      v.classList.remove('active-view');
    }
  });

  DOM.navLinks.forEach(link => {
    if (link.getAttribute('data-view') === viewId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  if (viewId === 'ledger') {
    loadLedgerBlocks();
    loadLedgerResults();
  } else if (viewId === 'directory') {
    loadParties();
  }
}

// Data Loaders
async function loadElectionData() {
  try {
    const [cRes, pRes, infoRes] = await Promise.all([
      fetch('/api/constituencies'),
      fetch('/api/parties'),
      fetch('/api/election-info')
    ]);
    const cData = await cRes.json();
    const pData = await pRes.json();
    const infoData = await infoRes.json();

    if (infoData.status === 'success') {
      AppState.votingWindow = infoData.voting_window;
      AppState.windowState = infoData.current_window_state;
      AppState.precautions = infoData.voting_precautions;
      startLiveVotingTimer();
      renderPrecautionsList();
    }

    if (cData.status === 'success') {
      AppState.allConstituencies = cData.constituencies;
      renderConstituencySelect(cData.constituencies);
    }
    if (pData.status === 'success') {
      AppState.parties = pData.parties;
    }

    await loadConstituencyDetail(AppState.activeConstituencyCode);
    loadLedgerBlocks();
    loadLedgerResults();
  } catch (err) {
    console.error('Error fetching election data:', err);
  }
}

function renderConstituencySelect(list) {
  if (!DOM.constituencySelect) return;
  DOM.constituencySelect.innerHTML = list.map(c => {
    const name = AppState.lang === 'kn' ? `${c.code} - ${c.name_kn} (${c.district_kn})` : `${c.code} - ${c.name_en} (${c.district_en})`;
    return `<option value="${c.code}" ${c.code === AppState.activeConstituencyCode ? 'selected' : ''}>${name}</option>`;
  }).join('');
}

async function loadConstituencyDetail(code) {
  try {
    const res = await fetch(`/api/constituency/${code}`);
    const data = await res.json();
    if (data.status === 'success') {
      AppState.constituencyData = data.constituency;
      updateOverviewScreen(data.constituency);
      renderCandidateRoster();
    }
  } catch (err) {
    console.error('Error loading constituency detail:', err);
  }
}

// Voting Window Live Countdown Timer
function startLiveVotingTimer() {
  if (AppState.timerInterval) clearInterval(AppState.timerInterval);
  updateVotingWindowUI();
  AppState.timerInterval = setInterval(updateVotingWindowUI, 1000);
}

function updateVotingWindowUI() {
  if (!AppState.votingWindow) return;

  const now = new Date();
  const startsAt = new Date(AppState.votingWindow.starts_at);
  const endsAt = new Date(AppState.votingWindow.ends_at);

  let state = AppState.windowState;
  let targetTime = endsAt;
  let labelKey = 'timer_closes_in';

  if (now < startsAt && state !== 'open' && state !== 'closed') {
    state = 'upcoming';
    targetTime = startsAt;
    labelKey = 'timer_opens_in';
  } else if (now > endsAt && state !== 'open' && state !== 'upcoming') {
    state = 'closed';
  } else if (state === 'upcoming') {
    targetTime = startsAt;
    labelKey = 'timer_opens_in';
  }

  // Check state transition for accessible screen-reader announcement
  if (AppState.lastAnnouncedState !== state) {
    if (DOM.timerAriaAnnouncement) {
      const stateAnnounce = state === 'open' 
        ? (AppState.lang === 'kn' ? 'ಮತದಾನ ಪ್ರಕ್ರಿಯೆ ಈಗ ತೆರೆದಿದೆ.' : 'Voting is now open.')
        : (state === 'closed' 
            ? (AppState.lang === 'kn' ? 'ಮತದಾನದ ಅವಧಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ.' : 'Voting has closed.') 
            : (AppState.lang === 'kn' ? 'ಮತದಾನ ಇನ್ನೂ ಪ್ರಾರಂಭವಾಗಿಲ್ಲ.' : 'Voting is upcoming.'));
      DOM.timerAriaAnnouncement.textContent = stateAnnounce;
    }
    AppState.lastAnnouncedState = state;
  }

  AppState.windowState = state;

  // Update State Badge & Panel Styling
  if (DOM.windowStateBadge) {
    DOM.windowStateBadge.className = `window-state-badge ${state}`;
    DOM.windowStateBadge.textContent = t(`state_${state}`);
  }
  if (DOM.votingWindowPanel) {
    DOM.votingWindowPanel.className = `voting-window-panel state-${state}`;
  }

  // Update State Plain-Language Message
  if (DOM.windowStateMsg) {
    DOM.windowStateMsg.textContent = t(`window_${state}_msg`);
  }

  // Format Dates in readable IST
  if (DOM.windowDatesDisplay) {
    const sStr = startsAt.toLocaleDateString(AppState.lang === 'kn' ? 'kn-IN' : 'en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata'
    });
    const eStr = endsAt.toLocaleDateString(AppState.lang === 'kn' ? 'kn-IN' : 'en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata'
    });
    DOM.windowDatesDisplay.textContent = `${sStr} — ${eStr} (${t('timezone_label')})`;
  }

  if (DOM.windowTimerLabel) {
    DOM.windowTimerLabel.textContent = t(labelKey);
  }

  // Calculate remaining countdown
  const diffMs = targetTime - now;

  if (state === 'closed' || diffMs <= 0) {
    if (DOM.timerDays) DOM.timerDays.textContent = '00';
    if (DOM.timerHours) DOM.timerHours.textContent = '00';
    if (DOM.timerMins) DOM.timerMins.textContent = '00';
    if (DOM.timerSecs) DOM.timerSecs.textContent = '00';
    if (DOM.windowTimerLabel) DOM.windowTimerLabel.textContent = t('timer_closed_label');
  } else {
    const totalSecs = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (n) => String(n).padStart(2, '0');
    if (DOM.timerDays) DOM.timerDays.textContent = pad(days);
    if (DOM.timerHours) DOM.timerHours.textContent = pad(hours);
    if (DOM.timerMins) DOM.timerMins.textContent = pad(mins);
    if (DOM.timerSecs) DOM.timerSecs.textContent = pad(secs);
  }

  // Control ballot action bar based on window state
  updateBallotSelectionUI();
}

// Overview Screen
function updateOverviewScreen(c) {
  const nameEl = document.getElementById('overview-constituency-name');
  const distEl = document.getElementById('overview-district');
  const electorsEl = document.getElementById('overview-electors');
  const polledEl = document.getElementById('overview-polled');
  const turnoutEl = document.getElementById('overview-turnout');
  const roEl = document.getElementById('overview-ro');

  const cName = AppState.lang === 'kn' ? `${c.code} - ${c.name_kn}` : `${c.code} - ${c.name_en}`;
  const cDist = AppState.lang === 'kn' ? c.district_kn : c.district_en;
  const cRo = AppState.lang === 'kn' ? c.returning_officer_kn : c.returning_officer_en;

  if (nameEl) nameEl.textContent = cName;
  if (distEl) distEl.textContent = `${t('stat_district')}: ${cDist}`;
  if (electorsEl) electorsEl.textContent = Number(c.total_electors).toLocaleString(AppState.lang === 'kn' ? 'kn-IN' : 'en-IN');
  if (polledEl) polledEl.textContent = Number(c.total_polled).toLocaleString(AppState.lang === 'kn' ? 'kn-IN' : 'en-IN');
  if (turnoutEl) turnoutEl.textContent = `${c.turnout_percent}%`;
  if (roEl) roEl.textContent = cRo;
}

// Precautions Panel
function renderPrecautionsList() {
  if (!DOM.precautionsGrid || !AppState.precautions) return;

  DOM.precautionsGrid.innerHTML = AppState.precautions.map(p => {
    const title = AppState.lang === 'kn' ? p.title_kn : p.title_en;
    const desc = AppState.lang === 'kn' ? p.desc_kn : p.desc_en;
    return `
      <div class="precaution-item-box">
        <span class="precaution-num">${p.id}</span>
        <div class="precaution-text-content">
          <h4>${title}</h4>
          <p>${desc}</p>
        </div>
      </div>
    `;
  }).join('');
}

// Candidate Roster Rendering
function renderCandidateRoster() {
  if (!DOM.candidateRosterBody || !AppState.constituencyData) return;

  const searchQuery = DOM.ballotSearchInput ? DOM.ballotSearchInput.value.toLowerCase().trim() : '';
  const activeFilterBtn = document.querySelector('.ballot-filter-btn.active');
  const filterCat = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';

  const candidates = AppState.constituencyData.candidates.filter(cand => {
    const nameEn = (cand.name_en || '').toLowerCase();
    const nameKn = (cand.name_kn || '').toLowerCase();
    const partyEn = (cand.party_name_en || '').toLowerCase();
    const partyKn = (cand.party_name_kn || '').toLowerCase();
    const code = (cand.party_code || '').toLowerCase();

    const matchSearch = nameEn.includes(searchQuery) ||
                        nameKn.includes(searchQuery) ||
                        partyEn.includes(searchQuery) ||
                        partyKn.includes(searchQuery) ||
                        code.includes(searchQuery);

    if (!matchSearch) return false;
    if (filterCat === 'all') return true;
    if (filterCat === 'national') return cand.party_category_en.includes('National');
    if (filterCat === 'state') return cand.party_category_en.includes('State');
    if (filterCat === 'registered') return cand.party_category_en.includes('Registered') || cand.party_category_en.includes('Independent');
    if (filterCat === 'nota') return cand.party_code === 'NOTA';
    return true;
  });

  if (candidates.length === 0) {
    DOM.candidateRosterBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:32px; color:var(--text-muted);">
          ${AppState.lang === 'kn' ? 'ಯಾವುದೇ ಅಭ್ಯರ್ಥಿ ಕಂಡುಬಂದಿಲ್ಲ.' : 'No verified candidates match the filter criteria in this constituency.'}
        </td>
      </tr>
    `;
    return;
  }

  DOM.candidateRosterBody.innerHTML = candidates.map(c => {
    const isSelected = AppState.selectedCandidateId === c.id;
    const primaryName = AppState.lang === 'kn' ? c.name_kn : c.name_en;
    const subName = AppState.lang === 'kn' ? c.name_en : c.name_kn;
    const partyName = AppState.lang === 'kn' ? c.party_name_kn : c.party_name_en;
    const partyCat = AppState.lang === 'kn' ? c.party_category_kn : c.party_category_en;
    const symbolName = AppState.lang === 'kn' ? c.symbol_name_kn : c.symbol_name_en;

    let symbolMarkup = `
      <div class="symbol-container">
        <img src="${c.symbol_url}" class="official-symbol-artwork" alt="${c.symbol_alt}" title="${c.symbol_alt}">
        <span class="symbol-caption-label">${symbolName}</span>
      </div>
    `;

    let badgeClass = 'national';
    if (c.party_category_en.includes('State')) badgeClass = 'state';
    if (c.party_code === 'NOTA') badgeClass = 'nota';

    return `
      <tr class="candidate-row ${isSelected ? 'selected-row' : ''}" data-id="${c.id}" tabindex="0" role="radio" aria-checked="${isSelected}">
        <td class="ballot-serial-no">${c.serial_no}</td>
        <td class="candidate-name-cell">
          <div class="candidate-primary-name">${primaryName}</div>
          <div class="candidate-sub-name">${subName}</div>
        </td>
        <td class="candidate-party-cell">
          <div class="party-primary-label">
            <strong>${c.party_code}</strong> - ${partyName}
          </div>
          <span class="party-category-badge ${badgeClass}">${partyCat}</span>
        </td>
        <td class="candidate-symbol-cell">${symbolMarkup}</td>
        <td class="candidate-radio-cell">
          <input type="radio" name="ballot-candidate" value="${c.id}" class="ballot-radio-input" ${isSelected ? 'checked' : ''} aria-label="Select candidate ${primaryName}">
        </td>
      </tr>
    `;
  }).join('');

  // Row selection event bindings
  const rows = DOM.candidateRosterBody.querySelectorAll('.candidate-row');
  rows.forEach(row => {
    const handleSelect = () => {
      const candId = row.getAttribute('data-id');
      AppState.selectedCandidateId = candId;
      rows.forEach(r => {
        r.classList.remove('selected-row');
        r.setAttribute('aria-checked', 'false');
        const radio = r.querySelector('.ballot-radio-input');
        if (radio) radio.checked = false;
      });
      row.classList.add('selected-row');
      row.setAttribute('aria-checked', 'true');
      const currentRadio = row.querySelector('.ballot-radio-input');
      if (currentRadio) currentRadio.checked = true;

      updateBallotSelectionUI();
    };

    row.addEventListener('click', handleSelect);
    row.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleSelect();
      }
    });
  });
}

// Voter Verification Handler
async function handleVerifyVoter() {
  const token = DOM.voterTokenInput.value.trim().toUpperCase();
  if (!token) {
    DOM.voterFeedback.className = 'voter-status-feedback invalid';
    DOM.voterFeedback.textContent = AppState.lang === 'kn' 
      ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯ ಡೆಮೊ ಟೋಕನ್ ನಮೂದಿಸಿ (ಉದಾ: KA-DEMO-1001).' 
      : 'Please enter a valid demo token (e.g. KA-DEMO-1001).';
    AppState.voterVerified = false;
    updateBallotSelectionUI();
    return;
  }

  try {
    const res = await fetch('/api/verify-voter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voter_token: token })
    });
    const data = await res.json();

    if (data.status === 'success') {
      AppState.voterToken = token;
      AppState.voterVerified = true;
      AppState.voterHasVoted = data.has_voted;

      if (data.has_voted) {
        DOM.voterFeedback.className = 'voter-status-feedback already-voted';
        DOM.voterFeedback.textContent = AppState.lang === 'kn' ? `❌ ${data.message_kn}` : `❌ ${data.message_en}`;
      } else {
        DOM.voterFeedback.className = 'voter-status-feedback valid';
        DOM.voterFeedback.textContent = AppState.lang === 'kn' ? `✅ ${data.message_kn}` : `✅ ${data.message_en}`;
      }
    } else {
      AppState.voterVerified = false;
      DOM.voterFeedback.className = 'voter-status-feedback invalid';
      DOM.voterFeedback.textContent = AppState.lang === 'kn' ? `⚠️ ${data.message_kn || data.message}` : `⚠️ ${data.message_en || data.message}`;
    }
  } catch (err) {
    DOM.voterFeedback.className = 'voter-status-feedback invalid';
    DOM.voterFeedback.textContent = AppState.lang === 'kn' ? 'ಟೋಕನ್ ಪರಿಶೀಲಿಸುವಲ್ಲಿ ನೆಟ್‌ವರ್ಕ್ ದೋಷ.' : 'Network error verifying token.';
  }
  updateBallotSelectionUI();
}

// Update sticky selection bar & button state
function updateBallotSelectionUI() {
  if (!DOM.btnReviewSelection || !DOM.selectedCandidateDisplay) return;

  // Check election window state first!
  const isWindowOpen = AppState.windowState === 'open';

  if (!isWindowOpen) {
    DOM.selectedCandidateDisplay.textContent = AppState.lang === 'kn' 
      ? `ಮತದಾನ ಸ್ಥಿತಿ: ${t(`state_${AppState.windowState}`)} — ಮತದಾನ ಅಸಾಧ್ಯ` 
      : `Voting Status: ${t(`state_${AppState.windowState}`)} — Submission disabled`;
    DOM.btnReviewSelection.disabled = true;
    return;
  }

  if (!AppState.selectedCandidateId) {
    DOM.selectedCandidateDisplay.textContent = t('no_cand_selected');
    DOM.btnReviewSelection.disabled = true;
    return;
  }

  const selectedCand = AppState.constituencyData?.candidates.find(c => c.id === AppState.selectedCandidateId);
  if (selectedCand) {
    const candName = AppState.lang === 'kn' ? selectedCand.name_kn : selectedCand.name_en;
    DOM.selectedCandidateDisplay.textContent = `${candName} (${selectedCand.party_code})`;
  }

  const canProceed = AppState.voterVerified && !AppState.voterHasVoted && isWindowOpen;
  DOM.btnReviewSelection.disabled = !canProceed;

  if (!AppState.voterVerified && AppState.selectedCandidateId) {
    DOM.selectedCandidateDisplay.textContent += AppState.lang === 'kn' ? ' — (ದಯವಿಟ್ಟು ಟೋಕನ್ ಪರಿಶೀಲಿಸಿ)' : ' — (Please verify demo token)';
  } else if (AppState.voterHasVoted) {
    DOM.selectedCandidateDisplay.textContent += AppState.lang === 'kn' ? ' — (ಈಗಾಗಲೇ ಮತ ಚಲಾಯಿಸಲಾಗಿದೆ)' : ' — (Token already cast ballot)';
  }
}

// Review Dialog
function openReviewDialog() {
  if (!AppState.selectedCandidateId || !AppState.constituencyData) return;
  const cand = AppState.constituencyData.candidates.find(c => c.id === AppState.selectedCandidateId);
  if (!cand) return;

  const cName = AppState.lang === 'kn' ? `${AppState.constituencyData.code} - ${AppState.constituencyData.name_kn}` : `${AppState.constituencyData.code} - ${AppState.constituencyData.name_en}`;
  const candName = AppState.lang === 'kn' ? cand.name_kn : cand.name_en;
  const partyName = AppState.lang === 'kn' ? cand.party_name_kn : cand.party_name_en;
  const symbolName = AppState.lang === 'kn' ? cand.symbol_name_kn : cand.symbol_name_en;

  DOM.reviewSummaryDetails.innerHTML = `
    <div style="background:var(--bg-subtle); border:1.5px solid var(--border-medium); border-radius:var(--radius-md); padding:16px; margin-bottom:14px;">
      <div style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase;">
        ${AppState.lang === 'kn' ? 'ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ' : 'Constituency'}
      </div>
      <div style="font-size:14px; font-weight:800; color:var(--text-primary); margin-bottom:12px;">
        ${cName}
      </div>

      <div style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase;">
        ${AppState.lang === 'kn' ? 'ಆಯ್ಕೆಯಾದ ಅಭ್ಯರ್ಥಿ' : 'Candidate Selection'}
      </div>
      <div style="font-size:17px; font-weight:800; color:var(--ka-red);">
        ${candName}
      </div>
      <div style="font-size:12.5px; color:var(--text-secondary); margin-bottom:12px;">
        ${partyName} (${cand.party_code}) — ${AppState.lang === 'kn' ? 'ಚಿಹ್ನೆ:' : 'Symbol:'} ${symbolName}
      </div>

      <div style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase;">
        ${AppState.lang === 'kn' ? 'ಮತದಾರರ ಡೆಮೊ ಕೋಡ್' : 'Voter Demo Token'}
      </div>
      <div style="font-size:13.5px; font-weight:700; font-family:var(--font-mono); color:var(--text-primary);">
        ${AppState.voterToken}
      </div>
    </div>

    <div style="font-size:11.5px; color:var(--text-secondary); line-height:1.5;">
      🔒 <strong>${AppState.lang === 'kn' ? 'ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ಗೌಪ್ಯತಾ ಸೂಚನೆ:' : 'Cryptographic Blinding Note:'}</strong>
      ${AppState.lang === 'kn' 
        ? 'ರಹಸ್ಯ ಮತದಾನದ ತತ್ವದಂತೆ, ನಿಮ್ಮ ಮತದಾನದ ವಿವರಗಳನ್ನು ಝೀರೋ-ನಾಲೆಡ್ಜ್ ಬ್ಲೈಂಡಿಂಗ್ ಮೂಲಕ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಲಾಗುತ್ತದೆ. ಸಾರ್ವಜನಿಕ ಲೆಡ್ಜರ್ ಅಥವಾ ರಶೀದಿಯು ನಿಮ್ಮ ಆಯ್ಕೆಯನ್ನು ಬಹಿರಂಗಪಡಿಸುವುದಿಲ್ಲ.' 
        : 'In accordance with constitutional ballot secrecy, this prototype calculates a zero-knowledge commitment hash before submitting to the local mock mempool. Neither the public ledger nor the public receipt will record your choice or identity.'}
    </div>
  `;

  DOM.reviewDialog.showModal();
}

// Submit Ballot
async function handleSubmitBallot() {
  DOM.btnConfirmVote.disabled = true;
  DOM.btnConfirmVote.textContent = AppState.lang === 'kn' ? 'ದಾಖಲಾಗುತ್ತಿದೆ...' : 'Recording to Mempool...';

  try {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voter_token: AppState.voterToken,
        constituency_code: AppState.activeConstituencyCode,
        candidate_id: AppState.selectedCandidateId
      })
    });
    const data = await res.json();

    if (data.status === 'success') {
      AppState.latestReceipt = data.receipt;
      AppState.voterHasVoted = true;
      DOM.reviewDialog.close();
      renderReceipt(data.receipt);
      switchView('receipt');
      loadLedgerBlocks();
    } else {
      const errMsg = AppState.lang === 'kn' ? (data.message_kn || data.message) : (data.message_en || data.message);
      alert(`Submission Error: ${errMsg}`);
    }
  } catch (err) {
    alert(AppState.lang === 'kn' ? 'ಮತದಾನ ಸಲ್ಲಿಸುವಲ್ಲಿ ನೆಟ್‌ವರ್ಕ್ ದೋಷ.' : 'Network error submitting vote.');
  } finally {
    DOM.btnConfirmVote.disabled = false;
    DOM.btnConfirmVote.textContent = t('btn_confirm_submit');
  }
}

// Render Receipt
function renderReceipt(receipt) {
  if (!DOM.receiptContainer) return;
  DOM.receiptEmptyState.style.display = 'none';
  DOM.receiptContainer.style.display = 'block';

  const cName = AppState.lang === 'kn' ? receipt.constituency_name_kn : receipt.constituency_name_en;

  DOM.receiptContainer.innerHTML = `
    <div class="receipt-card">
      <div class="receipt-stamp-header">
        <div class="receipt-stamp-badge">✓</div>
        <div>
          <div class="receipt-stamp-title">${t('receipt_title')}</div>
          <div class="receipt-stamp-sub">${t('receipt_desc')}</div>
        </div>
      </div>

      <div class="receipt-grid">
        <div class="receipt-field-row">
          <span class="receipt-field-label">Transaction ID (TxID)</span>
          <span class="receipt-field-value">${receipt.tx_id}</span>
        </div>
        <div class="receipt-field-row">
          <span class="receipt-field-label">${AppState.lang === 'kn' ? 'ಸಮಯ' : 'Timestamp'}</span>
          <span class="receipt-field-value">${receipt.timestamp}</span>
        </div>
        <div class="receipt-field-row">
          <span class="receipt-field-label">${AppState.lang === 'kn' ? 'ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ' : 'Constituency'}</span>
          <span class="receipt-field-value">${receipt.constituency_code} - ${cName || receipt.constituency_name}</span>
        </div>
        <div class="receipt-field-row">
          <span class="receipt-field-label">Ballot Commitment</span>
          <span class="receipt-field-value">${receipt.ballot_commitment}</span>
        </div>
        <div class="receipt-field-row">
          <span class="receipt-field-label">Merkle Leaf Root</span>
          <span class="receipt-field-value">${receipt.merkle_leaf}</span>
        </div>
        <div class="receipt-field-row">
          <span class="receipt-field-label">${AppState.lang === 'kn' ? 'ಲೆಡ್ಜರ್ ಸ್ಥಿತಿ' : 'Ledger State'}</span>
          <span class="receipt-field-value" style="color:var(--status-amber);">${receipt.status}</span>
        </div>
      </div>

      <div class="zero-knowledge-privacy-box">
        <div class="zk-icon">🛡️</div>
        <div>
          <div class="zk-title">${t('zk_why_title')}</div>
          <div class="zk-desc">${t('zk_why_desc')}</div>
        </div>
      </div>

      <div class="receipt-actions" style="display:flex; justify-content:flex-end; gap:12px;">
        <button class="btn-secondary" onclick="switchView('ballot')">${AppState.lang === 'kn' ? 'ಮತಪತ್ರಕ್ಕೆ ಮರಳಿ' : 'Return to Ballot'}</button>
        <button class="btn-primary" onclick="switchView('ledger')">${AppState.lang === 'kn' ? 'ಲೆಡ್ಜರ್ ಅನ್ವೇಷಕದಲ್ಲಿ ವೀಕ್ಷಿಸಿ' : 'Inspect in Ledger Explorer'}</button>
      </div>
    </div>
  `;
}

// Party Directory Rendering
function renderPartyDirectory() {
  if (!DOM.partyGridContainer || !AppState.parties) return;

  const searchQuery = DOM.partySearchInput ? DOM.partySearchInput.value.toLowerCase().trim() : '';
  const activeBtn = document.querySelector('.party-filter-btn.active');
  const filterVal = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';

  const contestingPartyCodes = new Set();
  if (AppState.constituencyData) {
    AppState.constituencyData.candidates.forEach(c => contestingPartyCodes.add(c.party_code));
  }

  const filtered = AppState.parties.filter(p => {
    const nameEn = (p.official_name_en || '').toLowerCase();
    const nameKn = (p.official_name_kn || '').toLowerCase();
    const abbr = (p.abbreviation || '').toLowerCase();

    const matchSearch = nameEn.includes(searchQuery) ||
                        nameKn.includes(searchQuery) ||
                        abbr.includes(searchQuery);
    if (!matchSearch) return false;

    if (filterVal === 'all') return true;
    if (filterVal === 'national') return p.recognition_level === 'national';
    if (filterVal === 'state') return p.recognition_level === 'state_karnataka';
    if (filterVal === 'registered') return p.recognition_level === 'registered_unrecognized';
    if (filterVal === 'contesting') return contestingPartyCodes.has(p.code);
    return true;
  });

  if (filtered.length === 0) {
    DOM.partyGridContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:40px; color:var(--text-muted); background:white; border-radius:8px;">
        ${AppState.lang === 'kn' ? 'ಯಾವುದೇ ಪಕ್ಷದ ದಾಖಲೆಗಳು ಲಭ್ಯವಿಲ್ಲ.' : 'No registered parties found matching search criteria.'}
      </div>
    `;
    return;
  }

  DOM.partyGridContainer.innerHTML = filtered.map(p => {
    const isContesting = contestingPartyCodes.has(p.code);
    const fullName = AppState.lang === 'kn' ? p.official_name_kn : p.official_name_en;
    const subName = AppState.lang === 'kn' ? p.official_name_en : p.official_name_kn;
    const recStatus = AppState.lang === 'kn' ? p.recognition_status_kn : p.recognition_status_en;
    const reservedSym = AppState.lang === 'kn' ? p.reserved_symbol_kn : p.reserved_symbol_en;

    const contestText = isContesting 
      ? (AppState.lang === 'kn' ? `✓ AC ${AppState.activeConstituencyCode} ನಲ್ಲಿ ಅಭ್ಯರ್ಥಿ ಸ್ಪರ್ಧಿಸುತ್ತಿದ್ದಾರೆ` : `✓ Contesting in AC ${AppState.activeConstituencyCode}`)
      : (AppState.lang === 'kn' ? `• ನೋಂದಾಯಿತ ಪಕ್ಷ; AC ${AppState.activeConstituencyCode} ನಲ್ಲಿ ಅಭ್ಯರ್ಥಿಯಿಲ್ಲ` : `• Registry member; not fielding candidate in AC ${AppState.activeConstituencyCode}`);

    return `
      <div class="party-card">
        <div class="party-card-top">
          <img src="${p.symbol_url}" class="party-card-logo" alt="${p.symbol_alt}" title="${p.symbol_alt}">
          <div class="party-card-info">
            <div class="party-card-abbr">
              ${p.abbreviation}
              <span class="party-category-badge ${p.recognition_level === 'national' ? 'national' : (p.recognition_level === 'state_karnataka' ? 'state' : '')}">
                ${recStatus}
              </span>
            </div>
            <div style="font-size:13px; font-weight:700; color:var(--text-primary); margin-top:2px;">${fullName}</div>
            <div style="font-size:11.5px; color:var(--text-muted);">${subName}</div>
          </div>
        </div>

        <div class="party-meta-list">
          <div class="party-meta-row">
            <span>${AppState.lang === 'kn' ? 'ಚಿಹ್ನೆ:' : 'Reserved/Free Symbol:'}</span>
            <strong>${reservedSym}</strong>
          </div>
          <div class="party-meta-row">
            <span>ECI Ref:</span>
            <strong>${p.eci_registration_ref}</strong>
          </div>
          <div class="party-meta-row">
            <span>${AppState.lang === 'kn' ? 'ಕೇಂದ್ರ ಕಚೇರಿ:' : 'Head Office:'}</span>
            <span style="max-width:180px; text-align:right;">${p.headquarters.split(',')[0]}</span>
          </div>
        </div>

        <div class="party-contesting-chip ${isContesting ? 'contesting' : 'not-contesting'}">
          ${contestText}
        </div>
      </div>
    `;
  }).join('');
}

async function loadParties() {
  try {
    const res = await fetch(`/api/parties?constituency=${AppState.activeConstituencyCode}`);
    const data = await res.json();
    if (data.status === 'success') {
      AppState.parties = data.parties;
      renderPartyDirectory();
    }
  } catch (err) {
    console.error('Error fetching parties:', err);
  }
}

// Ledger Explorer
async function loadLedgerBlocks() {
  try {
    const res = await fetch('/api/blocks');
    const data = await res.json();
    if (data.status === 'success') {
      AppState.blocks = data.chain;
      AppState.mempool = data.mempool;

      const blockCountEl = document.getElementById('stat-block-count');
      const mempoolCountEl = document.getElementById('stat-mempool-count');
      const headerLedgerChip = document.getElementById('header-ledger-chip');

      if (blockCountEl) blockCountEl.textContent = data.block_count;
      if (mempoolCountEl) mempoolCountEl.textContent = data.mempool_count;
      if (headerLedgerChip) headerLedgerChip.textContent = `Mempool: ${data.mempool_count} • Blocks: ${data.block_count}`;
      if (DOM.mempoolBadge) DOM.mempoolBadge.textContent = `${data.mempool_count}`;

      if (DOM.btnMineBlock) {
        DOM.btnMineBlock.disabled = data.mempool_count === 0;
      }

      renderBlocksList(data.chain, data.mempool);
    }
  } catch (err) {
    console.error('Error loading blocks:', err);
  }
}

function renderBlocksList(chain, mempool) {
  if (!DOM.blocksContainer) return;

  let mempoolHtml = '';
  if (mempool && mempool.length > 0) {
    mempoolHtml = `
      <div style="background:#fffbeb; border:1px solid var(--ka-yellow-border); border-radius:var(--radius-md); padding:16px; margin-bottom:18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <strong style="color:var(--ka-gold); font-size:13px;">⏳ ${AppState.lang === 'kn' ? 'ಮೆಂಪೂಲ್ ವಹಿವಾಟುಗಳು' : 'Unconfirmed Mempool'} (${mempool.length})</strong>
          <span style="font-size:11px; color:var(--text-muted);">${AppState.lang === 'kn' ? 'ಮೈನಿಂಗ್ ಬಾಕಿ ಇದೆ' : 'Proof of Work Pending'}</span>
        </div>
        ${mempool.map(tx => `
          <div style="font-family:var(--font-mono); font-size:11px; background:white; padding:6px 10px; border-radius:4px; margin-bottom:6px; border:1px solid var(--border-subtle); display:flex; justify-content:space-between;">
            <span>TxID: ${tx.tx_id}</span>
            <span style="color:var(--status-amber);">[Mempool]</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  const blocksHtml = chain.slice().reverse().map(block => {
    return `
      <div class="block-card">
        <div class="block-card-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="block-height-tag">Block #${block.index}</span>
            <span style="font-size:11px; font-weight:800; color:var(--status-green);">✓ Confirmed</span>
          </div>
          <span class="block-time">${block.timestamp}</span>
        </div>

        <div class="block-hash-line">
          <strong>Block Hash:</strong> ${block.hash}
        </div>
        <div class="block-hash-line" style="color:var(--text-muted);">
          <strong>Prev Hash:</strong> ${block.previous_hash}
        </div>
        <div class="block-hash-line" style="color:var(--text-muted);">
          <strong>Merkle Root:</strong> ${block.merkle_root}
        </div>

        <div class="block-meta-row" style="display:flex; gap:16px; font-size:11.5px; color:var(--text-muted); margin-top:8px;">
          <span>Transactions: <strong>${block.transactions.length}</strong></span>
          <span>PoW Nonce: <strong>${block.nonce}</strong></span>
          <span>Validator: <strong>${block.miner}</strong></span>
        </div>
      </div>
    `;
  }).join('');

  DOM.blocksContainer.innerHTML = mempoolHtml + blocksHtml;
}

async function handleMineBlock() {
  if (!DOM.btnMineBlock) return;
  DOM.btnMineBlock.disabled = true;
  DOM.btnMineBlock.textContent = AppState.lang === 'kn' ? '⛏️ ಗಣಿಗಾರಿಕೆ ನಡೆಯುತ್ತಿದೆ...' : '⛏️ Mining Block (SHA-256 PoW)...';

  try {
    const res = await fetch('/api/mine', { method: 'POST' });
    const data = await res.json();
    if (data.status === 'success') {
      await loadLedgerBlocks();
      await loadLedgerResults();
      alert(AppState.lang === 'kn' ? 'ಬ್ಲಾಕ್ ಯಶಸ್ವಿಯಾಗಿ ಮೈನ್ ಆಗಿದೆ!' : `Mined successfully: ${data.data.message}`);
    } else {
      alert(AppState.lang === 'kn' ? data.message_kn : data.message);
    }
  } catch (err) {
    alert('Error executing mining transaction.');
  } finally {
    DOM.btnMineBlock.textContent = t('btn_mine');
    DOM.btnMineBlock.disabled = AppState.mempool.length === 0;
  }
}

async function loadLedgerResults() {
  try {
    const res = await fetch(`/api/results?constituency=${AppState.activeConstituencyCode}`);
    const data = await res.json();
    if (data.status === 'success') {
      AppState.results = data.results;
      renderResultsTally(data.results[AppState.activeConstituencyCode]);
    }
  } catch (err) {
    console.error('Error fetching results:', err);
  }
}

function renderResultsTally(cResult) {
  if (!DOM.resultsContainer || !cResult) return;

  const totalVotes = cResult.total_simulated_votes;
  const candidates = cResult.candidates;
  const cName = AppState.lang === 'kn' ? cResult.constituency_name_kn : cResult.constituency_name_en;

  DOM.resultsContainer.innerHTML = `
    <div style="font-size:12px; color:var(--text-muted); margin-bottom:14px;">
      ${AppState.lang === 'kn' 
        ? `ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ ${cResult.constituency_code} (${cName}) ನ <strong>ಖಚಿತಪಡಿಸಿದ ಬ್ಲಾಕ್‌ಗಳಿಂದ</strong> ಲೆಕ್ಕಹಾಕಲಾದ ಫಲಿತಾಂಶ.` 
        : `Aggregated strictly from <strong>confirmed mined blocks</strong> in Constituency ${cResult.constituency_code} (${cName}).`}
      <br>
      ${AppState.lang === 'kn' ? 'ಒಟ್ಟು ಚಲಾವಣೆಯಾದ ಸಿಮ್ಯುಲೇಟೆಡ್ ಮತಗಳು:' : 'Total Simulated Votes Cast:'} <strong>${totalVotes}</strong>
    </div>
    ${candidates.map(cand => {
      const pct = totalVotes > 0 ? (cand.simulated_votes / totalVotes) * 100 : 0;
      const candName = AppState.lang === 'kn' ? cand.name_kn : cand.name_en;
      return `
        <div class="tally-row">
          <div class="tally-labels">
            <span><strong>${cand.party_code}</strong> — ${candName}</span>
            <span>${cand.simulated_votes} ${AppState.lang === 'kn' ? 'ಮತಗಳು' : 'vote(s)'} (${pct.toFixed(1)}%)</span>
          </div>
          <div class="tally-bar-track">
            <div class="tally-bar-fill" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('')}
  `;
}

// Reset Session
async function handleResetSession() {
  const confirmMsg = AppState.lang === 'kn' 
    ? 'ಡೆಮೊ ಅಧಿವೇಶನ ಮತ್ತು ಲೆಡ್ಜರ್ ಅನ್ನು ಮರುಹೊಂದಿಸಬೇಕೆ? ಎಲ್ಲಾ ಮೆಂಪೂಲ್ ಮತ್ತು ಸಿಮ್ಯುಲೇಟೆಡ್ ಮತಗಳು ಅಳಿಸಲ್ಪಡುತ್ತವೆ.'
    : 'Reset the demo session and ledger? All mempool transactions and simulated votes will be cleared to Genesis.';
  
  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch('/api/reset-demo', { method: 'POST' });
    const data = await res.json();
    if (data.status === 'success') {
      AppState.selectedCandidateId = null;
      AppState.voterVerified = false;
      AppState.voterHasVoted = false;
      AppState.voterToken = '';
      if (DOM.voterTokenInput) DOM.voterTokenInput.value = '';
      if (DOM.voterFeedback) {
        DOM.voterFeedback.textContent = '';
        DOM.voterFeedback.className = 'voter-status-feedback';
      }
      if (DOM.receiptContainer) {
        DOM.receiptContainer.style.display = 'none';
        DOM.receiptEmptyState.style.display = 'block';
      }
      updateBallotSelectionUI();
      renderCandidateRoster();
      await loadLedgerBlocks();
      await loadLedgerResults();
      switchView('overview');
      alert(AppState.lang === 'kn' ? 'ಡೆಮೊ ಅಧಿವೇಶನ ಯಶಸ್ವಿಯಾಗಿ ಮರುಹೊಂದಿಸಲಾಗಿದೆ.' : 'Demo session and ledger successfully reset to Genesis.');
    }
  } catch (err) {
    alert('Failed to reset session.');
  }
}
