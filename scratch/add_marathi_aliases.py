import json

FILE_PATH = r"d:/Artificail Intelligence Lab/Autonomous-Campus-Navigation-Agent-/backend/data/campus_locations.json"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

MARATHI_ALIASES = {
    "main-gate": ["मुख्य गेट", "गेट", "प्रवेशद्वार", "संजीवनी गेट", "मुख्य प्रवेशद्वार"],
    "main-library": ["लायब्ररी", "ग्रंथालय", "सेंट्रल लायब्ररी", "वाचनालय", "रीडिंग हॉल", "मध्यवर्ती ग्रंथालय"],
    "admin-block": ["ऑफिस", "प्रशासकीय इमारत", "प्रशासन", "प्राचार्य कार्यालय", "स्टुडंट सेक्शन", "कार्यालय"],
    "cse-dept": ["कॉम्प्युटर विभाग", "आयटी विभाग", "कॉम्प्युटर सायन्स", "आयटी", "संगणक विभाग"],
    "mech-dept": ["मेकॅनिकल विभाग", "मेकॅनिकल", "मेकॅट्रॉनिक्स विभाग"],
    "civil-dept": ["सिव्हिल विभाग", "सिव्हिल", "स्थापत्य विभाग"],
    "ece-dept": ["इलेक्ट्रॉनिक्स विभाग", "इलेक्ट्रिकल विभाग", "विद्युत विभाग"],
    "cafeteria": ["कँटीन", "कॅन्टीन", "मेस", "भोजन कक्ष", "नाश्ता", "संजीवनी कँटीन"],
    "sports-complex": ["ग्राउंड", "क्रीडांगण", "जिमखाना", "खेळाचे मैदान", "क्रिकेट ग्राउंड"],
    "boys-hostel": ["बॉईज हॉस्टेल", "मुले वसतिगृह", "सह्याद्री हॉस्टेल", "मुलांचे हॉस्टेल"],
    "girls-hostel": ["गर्ल्स हॉस्टेल", "मुली वसतिगृह", "गोदावरी हॉस्टेल", "मुलींचे हॉस्टेल"],
    "research-block": ["आयडिया लॅब", "संशोधन केंद्र", "३डी प्रिंटर", "रिसर्च ब्लॉक", "आयडिया लॅब कोपरगाव"],
    "seminar-room": ["अॅम्फीथिएटर", "खुले रंगमंच", "थिएटर", "स्टेज", "अम्फीथिएटर"],
    "fountain": ["फाउंटन", "सर्कल", "मध्यवर्ती चौक", "गोल चक्कर"],
    "workshop": ["वर्कशॉप", "कार्यशाळा", "मशीन शॉप"],
    "photocopy-center": ["झेरॉक्स", "स्टेशनरी", "फोटोकॉपी", "झेरॉक्स सेंटर"],
    "atm": ["एटीएम", "बँक", "एचडीएफसी"],
    "health-center": ["दवाखाना", "आरोग्य केंद्र", "डॉक्टर", "प्रथमोपचार"],
    "bus-stop": ["बस स्टॉप", "बस थांबा", "कॉलेज बस"],
    "auditorium": ["ऑडिटोरियम", "सभागृह", "एमबीए ब्लॉक", "एमबीए"],
    "canteen-north": ["नेस्कॅफे", "चहा", "स्नॅक्स"]
}

for loc in data.get("locations", []):
    loc_id = loc.get("id")
    if loc_id in MARATHI_ALIASES:
        existing = loc.get("aliases", [])
        for a in MARATHI_ALIASES[loc_id]:
            if a not in existing:
                existing.append(a)
        loc["aliases"] = existing

with open(FILE_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Updated campus_locations.json with Marathi aliases successfully!")
