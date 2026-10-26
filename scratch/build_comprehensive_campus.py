import json
import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

# ─────────────────────────────────────────────────────────────────────────────
# 1. CAMPUS LOCATIONS (Ground Truth Coordinates)
# ─────────────────────────────────────────────────────────────────────────────
LOCATIONS = [
    # ── Academic Departments & Institutes ──
    {
        "id": "diploma-polytechnic",
        "name": "Sanjivani K.B.P. Polytechnic (Diploma College)",
        "marathiName": "संजीवनी के.बी.पी. पॉलिटेक्निक (डिप्लोमा कॉलेज)",
        "aliases": ["diploma collge polytechnic", "diploma college", "polytechnic", "diploma", "kbp polytechnic", "sanjivani polytechnic", "पॉलिटेक्निक", "डिप्लोमा कॉलेज", "डिप्लोमा"],
        "category": "BUILDING",
        "lat": 19.90093851947799,
        "lng": 74.49489462009508,
        "floor": 1,
        "description": "Premier polytechnic institute offering technical diploma programs in mechanical, civil, computer, and electrical engineering.",
        "marathiDescription": "अभियांत्रिकी व तंत्रज्ञानातील पदविका (डिप्लोमा) अभ्यासक्रम देणारे अग्रगण्य तंत्रनिकेतन.",
        "timing": "9:00 AM - 5:30 PM",
        "highlights": ["Practical Workshop Labs", "CAD/CAM Studio", "Advanced Diploma Programs"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_polytechnic"
    },
    {
        "id": "cse-dept",
        "name": "Department of Computer Engineering",
        "marathiName": "संगणक अभियांत्रिकी विभाग",
        "aliases": ["computer engineering", "cse", "computer science", "cs dept", "comp dept", "comp", "संगणक विभाग", "कॉम्प्युटर विभाग", "comp ece"],
        "category": "BUILDING",
        "lat": 19.9009978,
        "lng": 74.4944759,
        "floor": 1,
        "description": "Specialized in AI/ML, Cloud Computing, High Performance Computing, and Software Systems.",
        "marathiDescription": "अत्याधुनिक AI/ML, क्लाउड कम्प्युटिंग आणि सॉफ्टवेअर सिस्टम्स प्रयोगशाळा.",
        "timing": "9:00 AM - 5:30 PM",
        "highlights": ["AI/ML Computing Lab", "AWS Cloud Innovation Center", "Smart Classrooms"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_cse"
    },
    {
        "id": "ece-dept",
        "name": "Electronics & Computer Engineering Department",
        "marathiName": "इलेक्ट्रॉनिक्स व कॉम्प्युटर अभियांत्रिकी",
        "aliases": ["electronics and computer", "ece", "electronics", "vlsi", "embedded", "इलेक्ट्रॉनिक्स विभाग", "comp ece", "ece dept"],
        "category": "BUILDING",
        "lat": 19.9009978,
        "lng": 74.4944759,
        "floor": 2,
        "description": "VLSI design, embedded systems, microcontrollers, and computer hardware-software co-design.",
        "marathiDescription": "व्हीएलएसआय (VLSI) आणि एम्बेडेड सिस्टीम्स डिझाईन लॅब.",
        "timing": "9:00 AM - 5:30 PM",
        "highlights": ["VLSI Design Center", "Embedded Systems Lab", "Robotics Interface"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_ece"
    },
    {
        "id": "it-dept",
        "name": "Department of Information Technology",
        "marathiName": "माहिती तंत्रज्ञान विभाग (IT)",
        "aliases": ["information technology", "it", "it dept", "cyber security", "data science", "माहिती तंत्रज्ञान विभाग", "आयटी", "it mba"],
        "category": "BUILDING",
        "lat": 19.9014237,
        "lng": 74.4950362,
        "floor": 2,
        "description": "Advanced cybersecurity, full-stack software development, cloud infrastructure, and data science.",
        "marathiDescription": "सायबर सुरक्षा, डेटा सायन्स आणि वेब टेक्नॉलॉजी लॅब.",
        "timing": "9:00 AM - 5:30 PM",
        "highlights": ["Cybersecurity Testbed", "Full-Stack Dev Lab", "Data Analytics Suite"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_it"
    },
    {
        "id": "mba-dept",
        "name": "Department of Management Studies (MBA)",
        "marathiName": "व्यवस्थापन शास्त्र विभाग (MBA)",
        "aliases": ["mba", "management studies", "mba dept", "business school", "seminar hall", "व्यवस्थापन विभाग", "it mba"],
        "category": "BUILDING",
        "lat": 19.9014237,
        "lng": 74.4950362,
        "floor": 1,
        "description": "Master of Business Administration, executive seminar halls, finance & marketing analytics labs.",
        "marathiDescription": "८०० क्षमतेचे वातानुकूलित सभागृह, एमबीए विभाग आणि कॉर्पोरेट प्लेसमेंट दालन.",
        "timing": "9:00 AM - 6:00 PM",
        "highlights": ["Executive Case Study Hall", "Financial Analytics Lab", "Corporate Placement Chambers"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_mba"
    },
    {
        "id": "mech-dept",
        "name": "Department of Mechanical Engineering",
        "marathiName": "मेकॅनिकल अभियांत्रिकी विभाग",
        "aliases": ["mechanical engineering", "mech", "mechanical", "ev lab", "cad lab", "मेकॅनिकल विभाग", "मेकॅनिकल", "mech civil"],
        "category": "BUILDING",
        "lat": 19.9016611,
        "lng": 74.4944883,
        "floor": 1,
        "description": "Premier department with EV design suites, thermodynamics testing rigs, and CAD/CAM modeling.",
        "marathiDescription": "ई-वाहन (EV) डिझाईन, थर्मोडायनामिक्स आणि कॅड/कॅम (CAD/CAM) प्रयोगशाळा.",
        "timing": "9:00 AM - 5:30 PM",
        "highlights": ["EV Powertrain Lab", "CATIA Design Studio", "IC Engine Testbed"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_mech"
    },
    {
        "id": "civil-dept",
        "name": "Department of Civil Engineering",
        "marathiName": "स्थापत्य (सिव्हिल) अभियांत्रिकी विभाग",
        "aliases": ["civil engineering", "civil", "surveying", "geotech", "concrete lab", "सिव्हिल विभाग", "mech civil"],
        "category": "BUILDING",
        "lat": 19.9016611,
        "lng": 74.4944883,
        "floor": 1,
        "description": "Modern surveying with Total Station, soil mechanics, environmental engineering, and GIS.",
        "marathiDescription": "टोटल स्टेशन सर्व्हे, सॉइल मेकॅनिक्स आणि पर्यावरण प्रयोगशाळा.",
        "timing": "9:00 AM - 5:30 PM",
        "highlights": ["Total Station Survey Lab", "Geotechnical Testing", "Environmental Engg Lab"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_civil"
    },
    {
        "id": "mechatronics-dept",
        "name": "Department of Mechatronics Engineering",
        "marathiName": "मेकॅट्रॉनिक्स अभियांत्रिकी विभाग",
        "aliases": ["mechatronics engineering", "mechatronics", "robotics", "automation", "plc lab", "मेकॅट्रॉनिक्स"],
        "category": "BUILDING",
        "lat": 19.9016948,
        "lng": 74.4948290,
        "floor": 1,
        "description": "Robotics, industrial automation, PLC programming, sensorics, and electromechanical integration.",
        "marathiDescription": "रोबोटिक्स, इंडस्ट्रियल ऑटोमेशन आणि पीएलसी प्रोग्रामिंग प्रयोगशाळा.",
        "timing": "9:00 AM - 5:30 PM",
        "highlights": ["6-Axis Industrial Robot", "Hydraulics & Pneumatics", "Sensorics Workstation"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_mechatronics"
    },
    {
        "id": "structural-dept",
        "name": "Department of Structural Engineering",
        "marathiName": "स्ट्रक्चरल अभियांत्रिकी विभाग",
        "aliases": ["structural engineering", "structural", "concrete technology", "earthquake engg", "स्ट्रक्चरल"],
        "category": "BUILDING",
        "lat": 19.9016948,
        "lng": 74.4948290,
        "floor": 2,
        "description": "Advanced concrete technology, earthquake-resistant structure design, and finite element modeling.",
        "marathiDescription": "प्रगत काँक्रीट तंत्रज्ञान आणि भूकंपरोधक संरचना डिझाईन लॅब.",
        "timing": "9:00 AM - 5:30 PM",
        "highlights": ["Non-Destructive Testing (NDT)", "Heavy Structures Testing Rig", "STAAD Pro Suite"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_structural"
    },
    {
        "id": "ee-dept",
        "name": "Department of Electrical Engineering",
        "marathiName": "विद्युत (इलेक्ट्रिकल) अभियांत्रिकी विभाग",
        "aliases": ["electrical engineering", "electrical", "ee", "power systems", "solar lab", "विद्युत विभाग", "इलेक्ट्रिकल"],
        "category": "BUILDING",
        "lat": 19.9016948,
        "lng": 74.4948290,
        "floor": 1,
        "description": "Smart power grids, high voltage systems, renewable solar power, and industrial electrical drives.",
        "marathiDescription": "सोलर एनर्जी, पॉवर सिस्टीम्स आणि इंडस्ट्रियल ड्राईव्ह्स लॅब.",
        "timing": "9:00 AM - 5:30 PM",
        "highlights": ["High Voltage Lab", "Solar Microgrid Testbench", "Industrial Drives Lab"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_ee"
    },
    {
        "id": "first-year-block",
        "name": "Engineering Science (First-Year Foundation Block)",
        "marathiName": "अभियांत्रिकी विज्ञान (प्रथम वर्ष विभाग)",
        "aliases": ["engineering science", "first year", "fe block", "fe dept", "foundation block", "physics lab", "chemistry lab", "प्रथम वर्ष"],
        "category": "BUILDING",
        "lat": 19.901150,
        "lng": 74.494250,
        "floor": 1,
        "description": "Dedicated foundation block for first-year engineering students with physics, chemistry, and mathematics labs.",
        "marathiDescription": "प्रथम वर्ष अभियांत्रिकी विद्यार्थ्यांसाठी स्वतंत्र इमारत, भौतिकशास्त्र व रसायनशास्त्र लॅब्स.",
        "timing": "8:30 AM - 5:00 PM",
        "highlights": ["Engineering Physics Lab", "Engineering Chemistry Lab", "Language & Communication Lab"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_fe_block"
    },
    {
        "id": "research-block",
        "name": "AICTE IDEA Lab & Research Hub",
        "marathiName": "एआयसीटीई आयडिया लॅब आणि संशोधन केंद्र",
        "aliases": ["idea lab", "aicte idea lab", "research", "innovation lab", "3d printing", "आयडिया लॅब"],
        "category": "BUILDING",
        "lat": 19.901950,
        "lng": 74.494550,
        "floor": 1,
        "description": "Flagship AICTE IDEA Lab equipped with advanced 3D printers, laser cutting & engraving, and IoT testing.",
        "marathiDescription": "३D प्रिंटर, लेझर कटिंग आणि आयओटी उपकरणांनी सज्ज अत्याधुनिक आयडिया लॅब.",
        "timing": "9:00 AM - 7:00 PM",
        "highlights": ["Industrial 3D Printers", "Laser Cutting Machines", "PCB Prototyping Bay"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_idea_lab"
    },
    {
        "id": "workshop",
        "name": "Central Engineering Workshop",
        "marathiName": "मध्यवर्ती अभियांत्रिकी कार्यशाळा",
        "aliases": ["workshop", "central workshop", "machine shop", "fitting", "welding", "carpentry", "वर्कशॉप"],
        "category": "BUILDING",
        "lat": 19.901800,
        "lng": 74.494300,
        "floor": 1,
        "description": "Heavy machinery and fabrication shop housing CNC machines, industrial lathes, welding booths, and foundry.",
        "marathiDescription": "सीएनसी मशीन्स, लेथ आणि वेल्डिंग बूथ असणारी मध्यवर्ती कार्यशाळा.",
        "timing": "8:30 AM - 5:30 PM",
        "highlights": ["CNC Machining Center", "Industrial Lathes Bay", "Welding & Smithy Shop"],
        "accessibility": False,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_workshop"
    },

    # ── Cultural, Event & Administration ──
    {
        "id": "main-gate",
        "name": "Sanjivani Main Entrance Gate",
        "marathiName": "संजीवनी मुख्य प्रवेशद्वार",
        "aliases": ["main gate", "entrance", "sanjivani gate", "gate 1", "front gate", "मुख्य गेट", "गेट", "प्रवेशद्वार"],
        "category": "GATE",
        "lat": 19.9003897,
        "lng": 74.4949413,
        "floor": 1,
        "description": "Iconic grand gateway on Kopargaon-Shirdi Road welcoming students, visitors, and alumni.",
        "marathiDescription": "कोपरगाव-शिर्डी रोडवरील भव्य मुख्य प्रवेशद्वार.",
        "timing": "Open 24x7 with Security",
        "highlights": ["Security Post", "Visitor Registration", "Main Shirdi Road Connection"],
        "accessibility": True,
        "photo": "/sanjivani_gate_real.png",
        "nodeId": "n_main_gate"
    },
    {
        "id": "seminar-room",
        "name": "Sanjivani Open Auditorium & Amphitheater",
        "marathiName": "संजीवनी खुले रंगमंच (ओपन ऑडिटोरियम)",
        "aliases": ["open auditorium", "auditorium", "amphitheater", "amphi", "open theatre", "lawn theatre", "stage", "अॅम्फीथिएटर", "खुले रंगमंच", "ऑडिटोरियम"],
        "category": "OPEN_AREA",
        "lat": 19.9013912,
        "lng": 74.4946667,
        "floor": 1,
        "description": "Picturesque tiered open-air theater hosting Sanjivani annual youth festivals, technical seminars, and cultural nights.",
        "marathiDescription": "सांस्कृतिक कार्यक्रम, युवा महोत्सव आणि स्नेहसंमेलनांसाठी हिरवळीने नटलेले सुंदर खुले रंगमंच.",
        "timing": "Open Daily",
        "highlights": ["1200+ Natural Lawn Seating", "Acoustic Stage Shell", "Cultural Heart of Campus"],
        "accessibility": True,
        "photo": "/sanjivani_amphitheater.jpg",
        "nodeId": "n_amphitheater"
    },
    {
        "id": "banquet-hall",
        "name": "Sanjivani Banquet Hall & Convention Center",
        "marathiName": "संजीवनी बँकक्वेट हॉल व सभागृह",
        "aliases": ["banquet hall", "banquet", "convention center", "hall", "celebration hall", "बँकक्वेट हॉल", "सभागृह"],
        "category": "BUILDING",
        "lat": 19.9035532,
        "lng": 74.4936568,
        "floor": 1,
        "description": "Grand air-conditioned convention and banquet hall for college functions, academic symposiums, and guest felicitations.",
        "marathiDescription": "भव्य वातानुकूलित बँकक्वेट हॉल, राष्ट्रीय परिषदा आणि महाविद्यालयीन कार्यक्रमांसाठी सुसज्ज सभागृह.",
        "timing": "8:00 AM - 10:00 PM",
        "highlights": ["Air-Conditioned Grand Auditorium", "Sound & Projection Systems", "VIP Reception Suite"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_banquet"
    },
    {
        "id": "admin-block",
        "name": "Administrative Block & Principal Office",
        "marathiName": "प्रशासकीय इमारत आणि प्राचार्य कार्यालय",
        "aliases": ["admin block", "admin", "office", "principal office", "registrar", "student section", "प्रशासकीय इमारत", "ऑफिस"],
        "category": "BUILDING",
        "lat": 19.900650,
        "lng": 74.494750,
        "floor": 1,
        "description": "Administrative headquarters including Principal Office, Student Section, and Accounts.",
        "marathiDescription": "प्राचार्य कार्यालय, विद्यार्थी विभाग आणि शिष्यवृत्ती कक्ष.",
        "timing": "9:30 AM - 5:30 PM",
        "highlights": ["Principal's Chamber", "Student Section Desk", "Exam & Scholarship Cell"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_admin"
    },
    {
        "id": "fountain",
        "name": "Sanjivani Central Roundabout & Palm Lawn",
        "marathiName": "मध्यवर्ती चौक व उद्यान",
        "aliases": ["roundabout", "circle", "fountain", "central lawn", "sanjivani circle", "फाउंटन", "सर्कल"],
        "category": "OPEN_AREA",
        "lat": 19.900700,
        "lng": 74.494650,
        "floor": 1,
        "description": "Central circular driveway surrounded by royal palms and manicured flower beds connecting all wings.",
        "marathiDescription": "सर्व शैक्षणिक विभागांना जोडणारा सुंदर मध्यवर्ती चौक आणि उद्यान.",
        "timing": "Open 24x7",
        "highlights": ["Campus Walkway Nexus", "Royal Palm Avenue", "Centrally Located"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_roundabout"
    },

    # ── Sports and Fitness Facilities ──
    {
        "id": "fitness-center",
        "name": "Central Fitness Center & Gymnasium",
        "marathiName": "मध्यवर्ती व्यायामशाळा (फिटनेस सेंटर)",
        "aliases": ["fitness center", "gym", "gymnasium", "workout", "weights", "व्यायामशाळा", "जिम"],
        "category": "BUILDING",
        "lat": 19.9028307,
        "lng": 74.4958727,
        "floor": 1,
        "description": "A fully equipped modern gym featuring cardio machinery, weight stacks, crossfit equipment, and trainers.",
        "marathiDescription": "आधुनिक कार्डिओ मशिन्स, वजन उचलण्याचे साहित्य आणि ट्रेनर्सयुक्त अद्ययावत व्यायामशाळा.",
        "timing": "6:00 AM - 9:00 AM & 5:00 PM - 8:30 PM",
        "highlights": ["Cardio Machinery & Treadmills", "Heavy Weight Stacks", "Certified Fitness Trainers"],
        "accessibility": True,
        "photo": "/sanjivani_aerial.jpg",
        "nodeId": "n_gym"
    },
    {
        "id": "sports-complex",
        "name": "Sanjivani University Ground & Sports Complex",
        "marathiName": "संजीवनी युनिव्हर्सिटी ग्राऊंड (क्रीडा संकुल)",
        "aliases": ["sanjivani university ground", "university ground", "sports complex", "cricket ground", "football ground", "ground", "क्रीडांगण", "मैदान", "sports"],
        "category": "OPEN_AREA",
        "lat": 19.9025315,
        "lng": 74.4949634,
        "floor": 1,
        "description": "Sprawling university sports grounds hosting cricket, football tournaments, athletic events, and annual sports days.",
        "marathiDescription": "क्रिकेट, फुटबॉल आणि ऍथलेटिक्स स्पर्धांसाठी आंतरराष्ट्रीय मानकांचे विस्तीर्ण विद्यापीठ क्रीडांगण.",
        "timing": "6:00 AM - 8:30 PM",
        "highlights": ["Full-Size Cricket Field", "Football Ground", "Athletic Running Track"],
        "accessibility": True,
        "photo": "/sanjivani_aerial.jpg",
        "nodeId": "n_sports"
    },
    {
        "id": "lawn-tennis-court",
        "name": "Sanjivani Lawn Tennis Court",
        "marathiName": "लॉन टेनिस कोर्ट",
        "aliases": ["lawn tennis court", "tennis court", "lawn tennis", "tennis", "लॉन टेनिस", "टेनिस कोर्ट"],
        "category": "OPEN_AREA",
        "lat": 19.9031970,
        "lng": 74.4946214,
        "floor": 1,
        "description": "Standard championship lawn tennis court with dedicated floodlights for daytime and evening practice.",
        "marathiDescription": "विद्यार्थ्यांसाठी उत्तम दर्जाचे लॉन टेनिस कोर्ट आणि फ्लडलाइट्सची सोय.",
        "timing": "6:00 AM - 8:30 PM",
        "highlights": ["Championship Synthetic Surface", "Floodlit Evening Play", "Professional Tennis Nets"],
        "accessibility": True,
        "photo": "/sanjivani_aerial.jpg",
        "nodeId": "n_tennis"
    },
    {
        "id": "basketball-ground",
        "name": "Sanjivani Basketball Ground",
        "marathiName": "बास्केटबॉल मैदान",
        "aliases": ["basketball ground", "basketball court", "basketball", "बास्केटबॉल मैदान", "बास्केटबॉल"],
        "category": "OPEN_AREA",
        "lat": 19.9032456,
        "lng": 74.4949225,
        "floor": 1,
        "description": "Full-size outdoor basketball court with asphalt surfacing, acrylic marking, and spectator seating.",
        "marathiDescription": "अंतरराष्ट्रीय आकाराचे बास्केटबॉल कोर्ट, मजबूत फायबरग्लास बोर्ड आणि प्रेक्षक व्यवस्था.",
        "timing": "6:00 AM - 8:30 PM",
        "highlights": ["Full-Size Regulation Court", "Fiberglass Backboards", "High-Mast Floodlighting"],
        "accessibility": True,
        "photo": "/sanjivani_aerial.jpg",
        "nodeId": "n_basketball"
    },
    {
        "id": "indoor-sports",
        "name": "Indoor Sports & Recreation Hall",
        "marathiName": "इनडोअर क्रीडा सभागृह",
        "aliases": ["indoor sports", "badminton hall", "table tennis", "carrom", "chess", "recreation hall", "इनडोअर स्पोर्ट्स"],
        "category": "BUILDING",
        "lat": 19.902950,
        "lng": 74.495950,
        "floor": 1,
        "description": "Dedicated recreation spaces for badminton courts, table tennis, carrom, and chess tournaments.",
        "marathiDescription": "बॅडमिंटन कोर्ट, टेबल टेनिस, कॅरम आणि बुद्धिबळ खेळांसाठी भव्य सभागृह.",
        "timing": "6:30 AM - 8:30 PM",
        "highlights": ["Wooden Badminton Courts", "Table Tennis Boards", "Chess & Carrom Hall"],
        "accessibility": True,
        "photo": "/sanjivani_aerial.jpg",
        "nodeId": "n_indoor_sports"
    },
    {
        "id": "girls-gym",
        "name": "Girls Private Workout Gym",
        "marathiName": "मुलींसाठी स्वतंत्र व्यायामशाळा",
        "aliases": ["girls gym", "private gym", "ladies gym", "girls workout", "मुलींची जिम"],
        "category": "OPEN_AREA",
        "lat": 19.901880,
        "lng": 74.495580,
        "floor": 1,
        "description": "An exclusive workout setup located safely inside the Girls Hostel compound.",
        "marathiDescription": "मुलींच्या वसतिगृह संकुलात सुरक्षित व्यायाम सुविधा.",
        "timing": "6:00 AM - 8:00 PM",
        "highlights": ["Exclusive Women Only Access", "Fitness Setup", "Full Safety & Privacy"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_girls_gym"
    },

    # ── Residential Hostels & Staff Housing ──
    {
        "id": "boys-hostel",
        "name": "Sahyadri Boys Hostel Wings",
        "marathiName": "सह्याद्री मुले वसतिगृह (१२०० क्षमता)",
        "aliases": ["boys hostel", "hostel", "sahayadri hostel", "boys dorm", "bh", "मुले वसतिगृह", "बॉईज हॉस्टेल"],
        "category": "BUILDING",
        "lat": 19.9035810,
        "lng": 74.4956397,
        "floor": 1,
        "description": "Secure residential buildings housing up to 1,200 students with high-speed Wi-Fi and solar hot water.",
        "marathiDescription": "परिसरातील सुरक्षित मुलांचे वसतिगृह, १२०० विद्यार्थी क्षमता, वाय-फाय व अभ्यासिकेची सोय.",
        "timing": "Gated 24x7 (In-time: 9:00 PM)",
        "highlights": ["1200 Student Capacity", "Dedicated Student Mess", "24x7 Wi-Fi & Generator Backup"],
        "accessibility": False,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_boys_hostel"
    },
    {
        "id": "girls-hostel",
        "name": "Godavari Girls Hostel Block",
        "marathiName": "गोदावरी मुली वसतिगृह (५३२+ क्षमता)",
        "aliases": ["girls hostel", "girsl hosotel", "ladies hostel", "godavari hostel", "gh", "girls dorm", "मुली वसतिगृह", "गर्ल्स हॉस्टेल"],
        "category": "BUILDING",
        "lat": 19.90189596498053,
        "lng": 74.4955247309237,
        "floor": 1,
        "description": "High-security residential premises situated fully inside campus perimeter, housing over 532 female students with biometric entry.",
        "marathiDescription": "मुलींचे अत्यंत सुरक्षित वसतिगृह, बायोमेट्रिक प्रवेश, ५३२+ विद्यार्थिनी क्षमता आणि लेडी वॉर्डन.",
        "timing": "Gated 24x7 (In-time: 7:30 PM)",
        "highlights": ["Biometric Gate Access", "In-house Resident Warden & Doctor", "Private Dining Hall"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_girls_hostel"
    },
    {
        "id": "staff-quarters",
        "name": "Sanjivani Staff Quarters & Faculty Residences",
        "marathiName": "शिक्षक व कर्मचारी निवासस्थान (स्टाफ क्वार्टर्स)",
        "aliases": ["staff quarters", "faculty quarters", "faculty residence", "quarters", "staff residence", "कर्मचारी निवास", "स्टाफ क्वार्टर्स"],
        "category": "BUILDING",
        "lat": 19.9036841,
        "lng": 74.4942107,
        "floor": 1,
        "description": "On-campus residential flats for professors, faculty members, and administrative staff providing immediate proximity to college departments.",
        "marathiDescription": "प्राध्यापक आणि शिक्षकेतर कर्मचाऱ्यांसाठी शांत व निसर्गरम्य परिसरातील निवासस्थाने.",
        "timing": "Residential 24x7",
        "highlights": ["Faculty Housing Complex", "Green Landscaped Surroundings", "24/7 Security Patrol"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_staff_quarters"
    },
    {
        "id": "rector-residence",
        "name": "Rector & Wardens Residence Quarters",
        "marathiName": "रेक्टर व वॉर्डन निवासस्थान",
        "aliases": ["rector residence", "warden quarter", "warden", "rector office", "रेक्टर निवास"],
        "category": "BUILDING",
        "lat": 19.903450,
        "lng": 74.493800,
        "floor": 1,
        "description": "Administrative quarters located directly inside the hostel blocks for 24/7 student supervision and welfare.",
        "marathiDescription": "विद्यार्थ्यांच्या २४ तास सुरक्षेसाठी वसतिगृह संकुलातील रेक्टर व वॉर्डन निवास.",
        "timing": "24x7 Availability",
        "highlights": ["24/7 Student Supervision", "Emergency Assistance Desk", "Campus Welfare Support"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_rector"
    },

    # ── Parking & Vehicle Zones ──
    {
        "id": "parking-north",
        "name": "Main Campus Parking Zone",
        "marathiName": "मुख्य विद्यार्थी व कर्मचारी वाहनतळ",
        "aliases": ["parking", "vehicle parking", "bike parking", "car park", "main parking", "वाहनतळ", "पार्किंग"],
        "category": "PARKING",
        "lat": 19.9008449,
        "lng": 74.4932454,
        "floor": 1,
        "description": "Spacious paved parking fields mapped out for student two-wheelers, faculty four-wheelers, and campus visitors.",
        "marathiDescription": "विद्यार्थी, प्राध्यापक आणि अभ्यागतांच्या दुचाकी व चारचाकी वाहनांसाठी स्वतंत्र प्रशस्त पार्किंग.",
        "timing": "Open 24x7 with Security",
        "highlights": ["Separate 2W & 4W Bays", "Security CCTV Monitored", "Direct Avenue to Main Gate"],
        "accessibility": True,
        "photo": "/sanjivani_gate_real.png",
        "nodeId": "n_parking"
    },
    {
        "id": "parking-sheds",
        "name": "Student Two-Wheeler Weather Sheds",
        "marathiName": "संरक्षक शेड्स वाहनतळ",
        "aliases": ["parking sheds", "bike sheds", "weather sheds", "roof parking", "पार्किंग शेड"],
        "category": "PARKING",
        "lat": 19.900950,
        "lng": 74.493350,
        "floor": 1,
        "description": "Overhead metal roofing structures built over two-wheeler parking lanes for sun & monsoon protection.",
        "marathiDescription": "ऊन व पावसापासून संरक्षणासाठी पत्र्याची छप्पर असणारे दुचाकी वाहनतळ.",
        "timing": "Open 24x7",
        "highlights": ["All-Weather Metal Roofing", "500+ Bike Capacity", "Paved Flooring"],
        "accessibility": True,
        "photo": "/sanjivani_gate_real.png",
        "nodeId": "n_parking_sheds"
    },
    {
        "id": "accessible-ramp-bay",
        "name": "Accessible Parking Bays & Ramps",
        "marathiName": "दिव्यांग सुलभ वाहनतळ व रॅम्प्स",
        "aliases": ["accessible parking", "wheelchair ramp", "disabled parking", "ramp", "दिव्यांग रॅम्प"],
        "category": "PARKING",
        "lat": 19.900800,
        "lng": 74.494700,
        "floor": 1,
        "description": "Dedicated accessible parking bays featuring smooth ramps for wheelchair transition directly to the main college walkways.",
        "marathiDescription": "थेट मुख्य इमारतींकडे जाणारे व्हिलचेअर सुलभ रॅम्प्स आणि राखीव वाहनतळ.",
        "timing": "Open 24x7 Priority Access",
        "highlights": ["Gradual Slope Wheelchair Ramps", "Direct Link to Admin & Classrooms", "Tactile Pavers"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_accessible_bay"
    },
    {
        "id": "bus-stop",
        "name": "Sanjivani Campus Bus Stand",
        "marathiName": "संजीवनी महाविद्यालय बस थांबा",
        "aliases": ["bus stop", "bus stand", "bus", "transport", "shuttle", "बस थांबा", "बस"],
        "category": "TRANSIT",
        "lat": 19.900250,
        "lng": 74.494950,
        "floor": 1,
        "description": "Dedicated fleet bay of 40+ institute buses connecting Kopargaon, Shirdi, Rahata, and Yeola.",
        "marathiDescription": "शिर्डी, राहाता आणि कोपरगाव परिसरासाठी धावणाऱ्या ४०+ बसेसचा थांबा.",
        "timing": "Buses Depart: 7:00 AM & 5:15 PM",
        "highlights": ["40+ Buses Fleet", "Direct Connectivity across Shirdi Region"],
        "accessibility": True,
        "photo": "/sanjivani_gate_real.png",
        "nodeId": "n_bus_stand"
    },

    # ── Dining & Food Outlets ──
    {
        "id": "cafeteria",
        "name": "Main Central Cafeteria & Food Court",
        "marathiName": "मध्यवर्ती कॅफेटेरिया (२५० चौ. मी. फूड कोर्ट)",
        "aliases": ["cafeteria", "canteen", "main canteen", "food court", "dining", "कँटीन", "कॅन्टीन", "नाश्ता", "caf"],
        "category": "BUILDING",
        "lat": 19.901850,
        "lng": 74.494650,
        "floor": 1,
        "description": "A 250-square-metre food court providing daily meals, hot Maharashtrian breakfast, fresh juices, and snacks.",
        "marathiDescription": "२५० चौरस मीटर विस्तीर्ण फूड कोर्ट, पोहे, मिसळ, थाळी जेवण आणि अल्पोपहार.",
        "timing": "7:30 AM - 8:30 PM",
        "highlights": ["250 sq. m Seating Capacity", "Hygienic Vegetarian Food", "Fresh Juice & Snacks Counter"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_cafeteria"
    },
    {
        "id": "hostel-mess",
        "name": "Hostel Central Mess Halls",
        "marathiName": "वसतिगृह मेस हॉल (४०० चौ. मी.)",
        "aliases": ["hostel mess", "mess", "dining hall", "boys mess", "girls mess", "मेस"],
        "category": "BUILDING",
        "lat": 19.903450,
        "lng": 74.495200,
        "floor": 1,
        "description": "Two independent dining facilities serving daily scheduled hygienic meals to residential hostellers.",
        "marathiDescription": "४०० चौरस मीटरचे दोन स्वतंत्र भोजन कक्ष, वसतिगृह विद्यार्थ्यांसाठी सकस भोजन.",
        "timing": "Breakfast: 7:30-9:30 AM | Lunch: 12-2 PM | Dinner: 7:30-9:30 PM",
        "highlights": ["400 sq. m Dining Space", "Nutritious Scheduled Meals", "RO Drinking Water Systems"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_hostel_mess"
    },
    {
        "id": "canteen-north",
        "name": "Campus Kiosks & Fast-Food Stalls",
        "marathiName": "कॅम्पस कियोस्क व स्नॅक्स कॉर्नर",
        "aliases": ["kiosk", "nescafe", "tea stall", "snack corner", "fast food", "juice center", "कियोस्क", "नेस्कॅफे"],
        "category": "BUILDING",
        "lat": 19.902900,
        "lng": 74.494400,
        "floor": 1,
        "description": "Multiple small juice corners, Nescafe kiosks, and fast-food stalls stationed near sports grounds.",
        "marathiDescription": "क्रीडांगण व शैक्षणिक इमारतींनजीक चहा, कॉफी आणि जलद नाश्ता मिळणारे कियोस्क.",
        "timing": "8:30 AM - 7:00 PM",
        "highlights": ["Cold Coffee & Tea", "Fresh Seasonal Juices", "Quick Snacks"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_kiosks"
    },

    # ── Academic Resource Center (Libraries) ──
    {
        "id": "main-library",
        "name": "Sanjivani Central Library",
        "marathiName": "संजीवनी मध्यवर्ती ग्रंथालय (५०,०००+ पुस्तके)",
        "aliases": ["central library", "central libraary", "library", "reading hall", "books", "reference section", "ग्रंथालय", "वाचनालय", "लायब्ररी", "lib"],
        "category": "BUILDING",
        "lat": 19.901251240445323,
        "lng": 74.49508576042132,
        "floor": 1,
        "description": "A multi-story resource hub holding a physical collection of over 50,000 reference books, text volumes, and journals.",
        "marathiDescription": "अद्ययावत मध्यवर्ती तांत्रिक ग्रंथालय, ५०,०००+ पुस्तके, ई-जर्नल्स आणि शांत वाचन कक्ष.",
        "timing": "8:00 AM - 10:00 PM",
        "highlights": ["50,000+ Volume Technical Collection", "Book Bank Scheme", "Air-Conditioned Atmosphere"],
        "accessibility": True,
        "photo": "/campus_library.jpg",
        "nodeId": "n_library"
    },
    {
        "id": "digital-library",
        "name": "Digital Research Wing & e-Library",
        "marathiName": "डिजिटल रिसर्च विंग व ई-जर्नल्स लॅब",
        "aliases": ["digital research wing", "digital library", "e library", "e journals", "ieee", "springer", "डिजिटल लायब्ररी"],
        "category": "BUILDING",
        "lat": 19.901280,
        "lng": 74.495120,
        "floor": 2,
        "description": "Dedicated computer terminals providing access to international IEEE, Springer, and ScienceDirect databases.",
        "marathiDescription": "IEEE, Springer व आंतरराष्ट्रीय जर्नल्सचे मोफत डिजिटल प्रवेश देणारे रिसर्च दालन.",
        "timing": "8:00 AM - 9:00 PM",
        "highlights": ["100+ High-speed Terminals", "IEEE Xplore & Springer Access", "DELNET Network Node"],
        "accessibility": True,
        "photo": "/campus_library.jpg",
        "nodeId": "n_digital_library"
    },
    {
        "id": "reading-lounges",
        "name": "Quiet Reading Lounges & Study Halls",
        "marathiName": "शांत वाचन कक्ष व स्टडी हॉल",
        "aliases": ["reading lounges", "reading hall", "study room", "study hall", "quiet room", "वाचन कक्ष", "अभ्यासिका"],
        "category": "BUILDING",
        "lat": 19.901220,
        "lng": 74.495110,
        "floor": 2,
        "description": "Large, well-lit study halls open throughout extended college hours for quiet self-study and exam preparation.",
        "marathiDescription": "परीक्षेच्या तयारीसाठी व स्वयंअध्ययनासाठी शांत, प्रकाशमय वाचन दालन.",
        "timing": "8:00 AM - Midnight (During Exams)",
        "highlights": ["Extended Night Reading Hours", "Ergonomic Study Desks", "Absolute Silence Zone"],
        "accessibility": True,
        "photo": "/campus_library.jpg",
        "nodeId": "n_reading_lounges"
    },
    {
        "id": "photocopy-center",
        "name": "Student Consumer Store & Xerox",
        "marathiName": "विद्यार्थी भांडार व झेरॉक्स केंद्र",
        "aliases": ["xerox", "photocopy", "stationery", "print", "store", "झेरॉक्स"],
        "category": "BUILDING",
        "lat": 19.901300,
        "lng": 74.494920,
        "floor": 1,
        "description": "Academic stationery, university exam journals, project spiral binding, and printing services.",
        "marathiDescription": "प्रोजेक्ट बाइंडिंग, झेरॉक्स, स्टेशनरी आणि जर्नल प्रिंटिंग केंद्र.",
        "timing": "8:30 AM - 7:30 PM",
        "highlights": ["Project Spiral Binding", "University Exam Bluebooks", "High-Speed Xerox"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_xerox"
    },

    # ── Essential Utilities ──
    {
        "id": "atm",
        "name": "HDFC Bank & 24/7 ATM Center",
        "marathiName": "एचडीएफसी बँक आणि २४/७ एटीएम",
        "aliases": ["atm", "bank", "hdfc", "hdfc atm", "cash", "एटीएम", "बँक"],
        "category": "BUILDING",
        "lat": 19.900450,
        "lng": 74.494880,
        "floor": 1,
        "description": "On-campus bank branch and 24/7 automated teller machine for tuition fee payment and cash withdrawals.",
        "marathiDescription": "महाविद्यालयातील बँक आणि २४ तास रोख रक्कम काढण्याची सोय.",
        "timing": "ATM: 24x7 | Bank: 10:00 AM - 4:00 PM",
        "highlights": ["24/7 ATM Cash Dispenser", "College Fee Deposit Counter"],
        "accessibility": True,
        "photo": "/sanjivani_gate_real.png",
        "nodeId": "n_atm"
    },
    {
        "id": "health-center",
        "name": "Campus First Aid & Medical Center",
        "marathiName": "आरोग्य केंद्र आणि रुग्णवाहिका",
        "aliases": ["health center", "medical", "clinic", "doctor", "first aid", "dispensary", "ambulance", "दवाखाना"],
        "category": "BUILDING",
        "lat": 19.900550,
        "lng": 74.494650,
        "floor": 1,
        "description": "On-campus dispensary with resident physician, emergency beds, and ambulance service.",
        "marathiDescription": "तातडीच्या उपचारांसाठी डॉक्टर, औषधे आणि रुग्णवाहिका सज्ज असणारे आरोग्य केंद्र.",
        "timing": "24x7 Emergency On-Call",
        "highlights": ["Resident Doctor Consultation", "Standby Campus Ambulance", "Free Student First-Aid"],
        "accessibility": True,
        "photo": "/sanjivani_campus_overview.png",
        "nodeId": "n_health"
    }
]

# Write backend campus_locations.json
backend_locations = []
for loc in LOCATIONS:
    backend_locations.append({
        "id": loc["id"],
        "name": loc["name"],
        "aliases": loc["aliases"],
        "category": loc["category"],
        "lat": loc["lat"],
        "lng": loc["lng"],
        "floor": loc["floor"],
        "description": loc["description"],
        "accessibility": loc["accessibility"]
    })

LOC_FILE = r"d:/Artificail Intelligence Lab/Autonomous-Campus-Navigation-Agent-/backend/data/campus_locations.json"
with open(LOC_FILE, "w", encoding="utf-8") as f:
    json.dump({"locations": backend_locations}, f, indent=2, ensure_ascii=False)
print(f"Saved {len(backend_locations)} locations to campus_locations.json")

# ─────────────────────────────────────────────────────────────────────────────
# 2. BUILDING NODES
# Building pins placed at designated ground-floor exterior entrances.
# ─────────────────────────────────────────────────────────────────────────────
NODE_OFFSETS = {
    # Comp & ECE at 19.9009978, 74.4944759
    "n_cse": (19.901015, 74.494495),
    "n_ece": (19.900980, 74.494455),
    # IT & MBA at 19.9014237, 74.4950362
    "n_it": (19.901445, 74.495055),
    "n_mba": (19.901405, 74.495015),
    # Mech & Civil at 19.9016611, 74.4944883
    "n_mech": (19.901675, 74.494505),
    "n_civil": (19.901645, 74.494465),
    # Mechatronics, Structural, Electrical at 19.9016948, 74.4948290
    "n_mechatronics": (19.9016948, 74.4948290),
    "n_ee": (19.901725, 74.494855),
    "n_structural": (19.901665, 74.494805),
    # Central Library at 19.901251240445323, 74.49508576042132
    "n_library": (19.901251240445323, 74.49508576042132),
    "n_digital_library": (19.901280, 74.495120),
    "n_reading_lounges": (19.901220, 74.495110),
}

nodes = []
for loc in LOCATIONS:
    nid = loc["nodeId"]
    if nid in NODE_OFFSETS:
        nlat, nlng = NODE_OFFSETS[nid]
    else:
        nlat, nlng = loc["lat"], loc["lng"]

    nodes.append({
        "id": nid,
        "lat": nlat,
        "lng": nlng,
        "location_id": loc["id"],
        "is_accessible": loc["accessibility"],
        "node_type": "LANDMARK" if loc["category"] != "GATE" else "ENTRANCE",
        "label": loc["name"].split("&")[0].split("(")[0].strip()
    })

# ─────────────────────────────────────────────────────────────────────────────
# 3. OUTDOOR ROADWAY & WALKWAY JUNCTIONS (No Cutting Through Buildings!)
# All movements run strictly on roads, paved walkways, or open plazas.
# ─────────────────────────────────────────────────────────────────────────────
JUNCTIONS = [
    # ── Main North-South Campus Spine (Boulevard) ──
    {"id": "w_main_gate_curb", "lat": 19.900400, "lng": 74.494920, "label": "Main Gate Curb"},
    {"id": "w_admin_circle", "lat": 19.900650, "lng": 74.494780, "label": "Admin Plaza Roundabout"},
    {"id": "w_poly_comp_cross", "lat": 19.900950, "lng": 74.494780, "label": "Polytechnic & Computing Crossing"},
    {"id": "w_auditorium_cross", "lat": 19.901350, "lng": 74.494780, "label": "Auditorium & Library Crossing"},
    {"id": "w_engg_plaza_cross", "lat": 19.901650, "lng": 74.494720, "label": "Central Engineering Crossing"},
    {"id": "w_central_plaza", "lat": 19.901900, "lng": 74.494700, "label": "Central Cafeteria Plaza"},
    {"id": "w_ground_south_cross", "lat": 19.902250, "lng": 74.494750, "label": "University Ground South Gateway"},

    # ── South & West Parking Avenues ──
    {"id": "w_parking_road_1", "lat": 19.900650, "lng": 74.494000, "label": "South Parking Avenue Mid"},
    {"id": "w_parking_road_2", "lat": 19.900700, "lng": 74.493350, "label": "Main Parking Entrance"},
    {"id": "w_west_perimeter_mid", "lat": 19.902000, "lng": 74.493400, "label": "West Perimeter Road Mid"},
    {"id": "w_west_perimeter_north", "lat": 19.903000, "lng": 74.493400, "label": "West Perimeter Road North"},

    # ── Exterior Building Courtyards (Exterior Entrances) ──
    {"id": "w_poly_front", "lat": 19.900940, "lng": 74.494850, "label": "Polytechnic Front Entrance"},
    {"id": "w_comp_court", "lat": 19.900980, "lng": 74.494550, "label": "Computer & ECE Courtyard"},
    {"id": "w_fe_path", "lat": 19.901100, "lng": 74.494350, "label": "First-Year Block Walkway"},
    {"id": "w_auditorium_entry", "lat": 19.901370, "lng": 74.494700, "label": "Open Auditorium Steps"},
    {"id": "w_library_it_court", "lat": 19.901350, "lng": 74.494950, "label": "Library & IT/MBA Central Courtyard"},
    {"id": "w_library_front", "lat": 19.901250, "lng": 74.495020, "label": "Central Library Porch"},
    {"id": "w_it_mba_front", "lat": 19.901420, "lng": 74.494980, "label": "IT & MBA Front Entrance"},
    {"id": "w_mech_civil_court", "lat": 19.901660, "lng": 74.494550, "label": "Mechanical & Civil Courtyard"},
    {"id": "w_workshop_path", "lat": 19.901750, "lng": 74.494350, "label": "Workshop Walkway"},
    {"id": "w_mechatronics_front", "lat": 19.901680, "lng": 74.494800, "label": "Mechatronics & Electrical Porch"},

    # ── East Residential Corridor (Girls Hostel to Gym) ──
    {"id": "w_girls_hostel_lane", "lat": 19.901720, "lng": 74.495200, "label": "Girls Hostel Entrance Lane"},
    {"id": "w_girls_hostel_gate", "lat": 19.901850, "lng": 74.495420, "label": "Girls Hostel Security Gate"},
    {"id": "w_east_ground_road", "lat": 19.902350, "lng": 74.495600, "label": "East Sports Road"},
    {"id": "w_gym_sports_junction", "lat": 19.902750, "lng": 74.495750, "label": "Gym & Sports Complex Junction"},

    # ── University Ground Perimeter Road (Wraps around, NEVER cuts through field) ──
    {"id": "w_ground_west_road", "lat": 19.902800, "lng": 74.494550, "label": "West Ground Road"},
    {"id": "w_courts_junction", "lat": 19.903150, "lng": 74.494550, "label": "Tennis & Basketball Promenade"},
    {"id": "w_ground_north_road", "lat": 19.903200, "lng": 74.495300, "label": "North Ground Promenade"},

    # ── North Residential & Facility Road (Boys Hostel, Banquet, Staff Quarters) ──
    {"id": "w_boys_hostel_lane", "lat": 19.903400, "lng": 74.495600, "label": "Boys Hostel Gateway Lane"},
    {"id": "w_north_staff_cross", "lat": 19.903450, "lng": 74.494400, "label": "North Staff Quarters Crossing"},
    {"id": "w_banquet_avenue", "lat": 19.903450, "lng": 74.493800, "label": "Banquet Hall Avenue"},
]

for j in JUNCTIONS:
    nodes.append({
        "id": j["id"],
        "lat": j["lat"],
        "lng": j["lng"],
        "location_id": None,
        "is_accessible": True,
        "node_type": "JUNCTION",
        "label": j["label"]
    })

node_dict = {n["id"]: n for n in nodes}

# ─────────────────────────────────────────────────────────────────────────────
# 4. PATHWAY EDGES (Strictly along outdoor streets, lanes, and plazas)
# NOTE: Building pins connect ONLY to exterior courtyard junctions.
# No building-to-building lines cutting through walls!
# ─────────────────────────────────────────────────────────────────────────────
EDGE_PAIRS = [
    # ── A. Main Gate Entrance & South Transit ──
    ("n_bus_stand", "n_main_gate"),
    ("n_main_gate", "w_main_gate_curb"),
    ("w_main_gate_curb", "n_atm"),
    ("w_main_gate_curb", "w_admin_circle"),
    ("w_admin_circle", "n_admin"),
    ("w_admin_circle", "n_health"),
    ("w_admin_circle", "n_roundabout"),

    # ── B. South Parking Avenue ──
    ("w_admin_circle", "w_parking_road_1"),
    ("w_parking_road_1", "w_parking_road_2"),
    ("w_parking_road_2", "n_parking"),
    ("n_parking", "n_parking_sheds"),
    ("w_parking_road_2", "w_west_perimeter_mid"),

    # ── C. Central Avenue (South Section: Polytechnic, Comp/ECE, FE Block) ──
    ("w_admin_circle", "w_poly_comp_cross"),
    # Polytechnic (East side of avenue)
    ("w_poly_comp_cross", "w_poly_front"),
    ("w_poly_front", "n_polytechnic"),
    # Comp & ECE (West side of avenue)
    ("w_poly_comp_cross", "w_comp_court"),
    ("w_comp_court", "n_cse"),
    ("w_comp_court", "n_ece"),
    ("w_comp_court", "w_fe_path"),
    ("w_fe_path", "n_fe_block"),
    ("w_comp_court", "n_accessible_bay"),

    # ── D. Central Avenue (Auditorium, Central Library, IT & MBA) ──
    ("w_poly_comp_cross", "w_auditorium_cross"),
    # Open Auditorium (West)
    ("w_auditorium_cross", "w_auditorium_entry"),
    ("w_auditorium_entry", "n_amphitheater"),
    # Library & IT/MBA (East courtyard)
    ("w_auditorium_cross", "w_library_it_court"),
    ("w_library_it_court", "w_library_front"),
    ("w_library_front", "n_library"),
    ("n_library", "n_digital_library"),
    ("n_library", "n_reading_lounges"),
    ("w_library_it_court", "n_xerox"),
    ("w_library_it_court", "w_it_mba_front"),
    ("w_it_mba_front", "n_it"),
    ("w_it_mba_front", "n_mba"),

    # ── E. Central Avenue (Engineering Complex: Mech, Civil, Workshop, Mechatronics, EE) ──
    ("w_auditorium_cross", "w_engg_plaza_cross"),
    # Mechanical & Civil & Workshop (West side)
    ("w_engg_plaza_cross", "w_mech_civil_court"),
    ("w_mech_civil_court", "n_mech"),
    ("w_mech_civil_court", "n_civil"),
    ("w_mech_civil_court", "w_workshop_path"),
    ("w_workshop_path", "n_workshop"),
    # Mechatronics, Electrical, Structural (East side)
    ("w_engg_plaza_cross", "w_mechatronics_front"),
    ("w_mechatronics_front", "n_mechatronics"),
    ("w_mechatronics_front", "n_ee"),
    ("w_mechatronics_front", "n_structural"),

    # ── F. East Residential Corridor (To Girls Hostel & Gym) ──
    # Road runs east around Mechatronics building to Girls Hostel
    ("w_mechatronics_front", "w_girls_hostel_lane"),
    ("w_library_it_court", "w_girls_hostel_lane"),
    ("w_girls_hostel_lane", "w_girls_hostel_gate"),
    ("w_girls_hostel_gate", "n_girls_hostel"),
    ("w_girls_hostel_gate", "n_girls_gym"),
    # Road continues north along east perimeter to Gym
    ("w_girls_hostel_gate", "w_east_ground_road"),
    ("w_east_ground_road", "w_gym_sports_junction"),
    ("w_gym_sports_junction", "n_gym"),
    ("w_gym_sports_junction", "n_indoor_sports"),

    # ── G. Central Plaza (Cafeteria & IDEA Lab) ──
    ("w_engg_plaza_cross", "w_central_plaza"),
    ("w_central_plaza", "n_cafeteria"),
    ("w_central_plaza", "n_idea_lab"),
    ("w_central_plaza", "w_ground_south_cross"),

    # ── H. University Ground Perimeter (Wraps around edges of field) ──
    # Main stadium stands entrance
    ("w_ground_south_cross", "n_sports"),
    # Road continues around West perimeter of ground
    ("w_ground_south_cross", "w_ground_west_road"),
    ("w_ground_west_road", "w_courts_junction"),
    # Tennis & Basketball Courts (North-west of ground)
    ("w_courts_junction", "n_tennis"),
    ("w_courts_junction", "n_basketball"),
    ("w_courts_junction", "n_kiosks"),
    # Road continues around North perimeter of ground connecting to Gym
    ("w_courts_junction", "w_ground_north_road"),
    ("w_ground_north_road", "w_gym_sports_junction"),

    # ── I. North Residential (Boys Hostel) ──
    ("w_gym_sports_junction", "w_boys_hostel_lane"),
    ("w_boys_hostel_lane", "n_boys_hostel"),
    ("w_boys_hostel_lane", "n_hostel_mess"),

    # ── J. North Convention & Staff Quarters (Staff Quarters, Banquet Hall) ──
    ("w_courts_junction", "w_north_staff_cross"),
    ("w_north_staff_cross", "n_staff_quarters"),
    ("w_north_staff_cross", "w_banquet_avenue"),
    ("w_banquet_avenue", "n_banquet"),
    ("w_banquet_avenue", "n_rector"),

    # ── K. West Campus Perimeter Loop (Banquet Hall back down to Parking) ──
    ("w_banquet_avenue", "w_west_perimeter_north"),
    ("w_west_perimeter_north", "w_west_perimeter_mid"),
    ("w_west_perimeter_mid", "w_parking_road_2"),
]

edges = []
edge_set = set()
for u, v in EDGE_PAIRS:
    if u not in node_dict or v not in node_dict:
        print(f"Warning: missing node {u} or {v}")
        continue
    pair_key = tuple(sorted([u, v]))
    if pair_key in edge_set:
        continue
    edge_set.add(pair_key)
    n1 = node_dict[u]
    n2 = node_dict[v]
    dist = haversine(n1["lat"], n1["lng"], n2["lat"], n2["lng"])
    eid = f"e_{u}_{v}"
    edges.append({
        "id": eid,
        "source_id": u,
        "target_id": v,
        "weight": max(dist, 4.0),
        "bidirectional": True,
        "surface": "PATH",
        "is_blocked": False,
        "tags": ["walkway", "paved"]
    })

GRAPH_FILE = r"d:/Artificail Intelligence Lab/Autonomous-Campus-Navigation-Agent-/backend/data/campus_graph.json"
with open(GRAPH_FILE, "w", encoding="utf-8") as f:
    json.dump({"nodes": nodes, "edges": edges}, f, indent=2, ensure_ascii=False)
print(f"Saved {len(nodes)} nodes and {len(edges)} edges to campus_graph.json")

# ─────────────────────────────────────────────────────────────────────────────
# 5. FRONTEND LANDMARKS TS
# ─────────────────────────────────────────────────────────────────────────────
ts_entries = []
for loc in LOCATIONS:
    nid = loc["nodeId"]
    if nid in NODE_OFFSETS:
        nlat, nlng = NODE_OFFSETS[nid]
    else:
        nlat, nlng = loc["lat"], loc["lng"]

    ts_entries.append(f"""  '{loc["id"]}': {{
    id: '{loc["id"]}',
    name: '{loc["name"]}',
    marathiName: '{loc["marathiName"]}',
    category: '{loc["category"]}',
    photo: '{loc["photo"]}',
    description: '{loc["description"]}',
    marathiDescription: '{loc["marathiDescription"]}',
    timing: '{loc.get("timing", "Open Daily")}',
    highlights: {json.dumps(loc.get("highlights", []), ensure_ascii=False)},
    isAccessible: {str(loc["accessibility"]).lower()},
    lat: {nlat},
    lng: {nlng},
    nodeId: '{loc["nodeId"]}',
  }}""")

ts_code = f"""export interface SanjivaniLandmarkInfo {{
  id: string
  name: string
  marathiName: string
  category: string
  photo: string
  description: string
  marathiDescription: string
  floor?: string
  timing?: string
  highlights?: string[]
  isAccessible: boolean
  lat: number
  lng: number
  nodeId: string
}}

export const SANJIVANI_LANDMARKS: Record<string, SanjivaniLandmarkInfo> = {{
{','.join(ts_entries)}
}}
"""

FRONTEND_TS = r"d:/Artificail Intelligence Lab/Autonomous-Campus-Navigation-Agent-/frontend/src/data/sanjivaniLandmarks.ts"
with open(FRONTEND_TS, "w", encoding="utf-8") as f:
    f.write(ts_code)
print("Saved sanjivaniLandmarks.ts successfully!")
