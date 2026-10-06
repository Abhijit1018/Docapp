// The clinic the demo is dressed as. Built from a specialty preset plus
// whatever the pitch URL overrides (?clinic=&doctor=&specialty=&area=&phone=).
// Every preset clinic and doctor is fictional.

export type Lang = "en" | "hi" | "gu";
export type L10n = Record<Lang, string>;
export type Specialty = "dental" | "physio" | "skin" | "child" | "general";

export interface Service {
  id: string;
  name: L10n;
  /** One line on what the visit covers. */
  about: L10n;
  fee: number;
}

export interface Clinic {
  specialty: Specialty;
  name: string;
  doctor: string;
  qualification: string;
  regNo: string;
  years: number;
  area: string;
  city: string;
  /** Ten digits, or null when the pitch URL did not give one. */
  phone: string | null;
  kind: L10n;
  quote: L10n;
  bring: L10n;
  services: Service[];
  slotMinutes: number;
  /** Sessions per weekday, index 0 = Sunday. Each session is [open, close). */
  hours: [number, number][][];
  /** Sample visit notes for seeded patients. */
  sampleNotes: string[];
  /** The complaints patients most often come in with. */
  conditions: L10n[];
  /** Four photos for this specialty, then four of the clinic itself. */
  photos: string[];
  /** Headline figures. Sample numbers in the demo; a real clinic supplies its own. */
  patientsSeen: number;
  rating: number;
}

export type ClinicParams = Partial<Record<"clinic" | "doctor" | "specialty" | "area" | "phone", string>>;
export const PARAM_KEYS = ["clinic", "doctor", "specialty", "area", "phone"] as const;

const WEEKDAY: [number, number][] = [[570, 780], [990, 1260]]; // 9:30–1:00, 4:30–9:00
const HOURS: [number, number][][] = [[[600, 780]], WEEKDAY, WEEKDAY, WEEKDAY, WEEKDAY, WEEKDAY, WEEKDAY];

type Preset = Omit<Clinic, "specialty" | "area" | "city" | "phone" | "hours" | "photos" | "patientsSeen" | "rating" | "conditions">;

const s = (id: string, fee: number, en: string, hi: string, gu: string): Service => ({
  id, fee, name: { en, hi, gu }, about: { en: "", hi: "", gu: "" },
});

const ABOUT: Record<Specialty, Record<string, [string, string, string]>> = {
  dental: {
    consult: ["Check-up, X-ray if needed, and a written treatment plan with costs.", "जाँच, ज़रूरत हो तो एक्स-रे, और ख़र्च के साथ लिखित इलाज प्लान।", "તપાસ, જરૂર હોય તો એક્સ-રે, અને ખર્ચ સાથે લેખિત સારવાર પ્લાન."],
    cleaning: ["Scaling to remove tartar and stains, then polishing.", "टार्टर और दाग़ हटाने के लिए स्केलिंग, फिर पॉलिश।", "છારી અને ડાઘ દૂર કરવા સ્કેલિંગ, પછી પૉલિશ."],
    filling: ["Tooth-coloured filling for a cavity, usually in one visit.", "कैविटी के लिए दाँत के रंग की फिलिंग, अक्सर एक ही बार में।", "પોલાણ માટે દાંતના રંગનું ફિલિંગ, મોટેભાગે એક જ મુલાકાતમાં."],
    rct: ["Treats an infected tooth and saves it. Done under local anaesthesia.", "संक्रमित दाँत का इलाज करके उसे बचाया जाता है। सुन्न करके किया जाता है।", "ચેપવાળા દાંતની સારવાર કરી તેને બચાવાય છે. બહેરું કરીને કરવામાં આવે છે."],
    braces: ["Assessment for braces or clear aligners, with timeline and cost.", "ब्रेसेस या क्लियर अलाइनर के लिए जाँच, समय और ख़र्च के साथ।", "બ્રેસીસ કે ક્લિયર અલાઇનર માટે તપાસ, સમયગાળો અને ખર્ચ સાથે."],
  },
  physio: {
    assess: ["A 30-minute examination, diagnosis and a session plan.", "30 मिनट की जाँच, निदान और सेशन का प्लान।", "30 મિનિટની તપાસ, નિદાન અને સેશનનો પ્લાન."],
    followup: ["Hands-on treatment and the next step in your exercises.", "हाथों से इलाज और कसरतों में अगला क़दम।", "હાથથી સારવાર અને કસરતોમાં આગળનું પગલું."],
    spine: ["For slipped disc, sciatica, spondylosis and posture pain.", "स्लिप डिस्क, सायटिका, स्पॉन्डिलोसिस और ग़लत पोस्चर के दर्द के लिए।", "સ્લિપ ડિસ્ક, સાયટિકા, સ્પોન્ડિલોસિસ અને ખોટા પોશ્ચરના દુખાવા માટે."],
    sports: ["Ligament, muscle and joint injuries, and a safe return to play.", "लिगामेंट, मांसपेशी और जोड़ की चोटें, सुरक्षित तरीक़े से खेल में वापसी।", "લિગામેન્ટ, સ્નાયુ અને સાંધાની ઈજાઓ, સલામત રીતે રમતમાં પાછા."],
    postop: ["After knee, hip, shoulder or spine surgery.", "घुटने, कूल्हे, कंधे या रीढ़ के ऑपरेशन के बाद।", "ઘૂંટણ, થાપા, ખભા કે કરોડના ઑપરેશન પછી."],
  },
  skin: {
    consult: ["Examination, diagnosis and a treatment plan for skin, hair or nails.", "त्वचा, बाल या नाख़ून की जाँच, निदान और इलाज का प्लान।", "ત્વચા, વાળ કે નખની તપાસ, નિદાન અને સારવારનો પ્લાન."],
    followup: ["A review of progress, and a change of medicines if needed.", "सुधार की जाँच और ज़रूरत हो तो दवा में बदलाव।", "સુધારાની તપાસ અને જરૂર હોય તો દવામાં ફેરફાર."],
    acne: ["Treatment for pimples, marks and scars.", "मुँहासे, दाग़ और निशान का इलाज।", "ખીલ, ડાઘ અને નિશાનની સારવાર."],
    hair: ["Tests and treatment for hair fall, dandruff and thinning.", "बाल झड़ने, रूसी और पतले होते बालों की जाँच और इलाज।", "વાળ ખરવા, ખોડો અને પાતળા થતા વાળની તપાસ અને સારવાર."],
    peel: ["A clinic procedure for pigmentation and dull skin.", "झाइयों और बेजान त्वचा के लिए क्लिनिक में होने वाली प्रक्रिया।", "પિગમેન્ટેશન અને નિસ્તેજ ત્વચા માટે ક્લિનિકમાં થતી પ્રક્રિયા."],
  },
  child: {
    consult: ["For fever, cough, stomach upsets and other illness.", "बुखार, खाँसी, पेट की तकलीफ़ और दूसरी बीमारियों के लिए।", "તાવ, ઉધરસ, પેટની તકલીફ અને બીજી બીમારીઓ માટે."],
    followup: ["A recheck for the same illness within five days.", "उसी बीमारी की पाँच दिन के अंदर दोबारा जाँच।", "એ જ બીમારીની પાંચ દિવસની અંદર ફરી તપાસ."],
    vaccine: ["Vaccines as per the national schedule, with the card updated.", "राष्ट्रीय टीकाकरण सूची के अनुसार टीके, कार्ड में एंट्री के साथ।", "રાષ્ટ્રીય રસીકરણ પત્રક મુજબ રસી, કાર્ડમાં નોંધ સાથે."],
    newborn: ["Weight, feeding and jaundice check in the first weeks.", "पहले हफ़्तों में वज़न, दूध पिलाने और पीलिया की जाँच।", "પહેલાં અઠવાડિયાંમાં વજન, ધાવણ અને કમળાની તપાસ."],
    growth: ["Height and weight tracking, with a diet chart.", "लंबाई और वज़न की निगरानी, डाइट चार्ट के साथ।", "ઊંચાઈ અને વજનની દેખરેખ, ડાયટ ચાર્ટ સાથે."],
  },
  general: {
    consult: ["For any new illness or health concern.", "किसी भी नई बीमारी या तकलीफ़ के लिए।", "કોઈ પણ નવી બીમારી કે તકલીફ માટે."],
    followup: ["A review of the same illness, with your reports.", "उसी बीमारी की रिपोर्ट के साथ दोबारा जाँच।", "એ જ બીમારીની રિપોર્ટ સાથે ફરી તપાસ."],
    chronic: ["Regular review of sugar, blood pressure and medicines.", "शुगर, ब्लड प्रेशर और दवाओं की नियमित जाँच।", "સુગર, બ્લડ પ્રેશર અને દવાઓની નિયમિત તપાસ."],
    checkup: ["A full examination, with advice on which tests you need.", "पूरी जाँच और कौन-से टेस्ट ज़रूरी हैं इसकी सलाह।", "સંપૂર્ણ તપાસ અને કયા ટેસ્ટ જરૂરી છે તેની સલાહ."],
    fever: ["Fever, cold, cough, dengue, typhoid and seasonal infections.", "बुखार, सर्दी, खाँसी, डेंगू, टाइफ़ाइड और मौसमी संक्रमण।", "તાવ, શરદી, ઉધરસ, ડેન્ગ્યુ, ટાઇફોઇડ અને મોસમી ચેપ."],
  },
};

const PRESETS: Record<Specialty, Preset> = {
  dental: {
    name: "Serenity Dental Clinic",
    doctor: "Dr. Nirali Vaidya",
    qualification: "BDS, MDS (Conservative Dentistry)",
    regNo: "GSDC A-4127",
    years: 14,
    slotMinutes: 20,
    kind: { en: "Dental clinic", hi: "दाँतों का क्लिनिक", gu: "દાંતનું દવાખાનું" },
    quote: {
      en: "Most people come to me after putting it off for months. I show you what I see on the screen and tell you the cost before I start.",
      hi: "ज़्यादातर लोग महीनों टालने के बाद आते हैं। हम स्क्रीन पर दिखाकर समझाते हैं और इलाज शुरू करने से पहले ख़र्च बता देते हैं।",
      gu: "મોટાભાગના લોકો મહિનાઓ સુધી ટાળ્યા પછી આવે છે. અમે સ્ક્રીન પર બતાવીને સમજાવીએ છીએ અને સારવાર શરૂ કરતા પહેલાં ખર્ચ જણાવીએ છીએ.",
    },
    bring: {
      en: "Old X-rays or dental records, if you have them.",
      hi: "पुराने एक्स-रे या दाँतों के काग़ज़ात, अगर हों।",
      gu: "જૂના એક્સ-રે કે દાંતના કાગળો, જો હોય તો.",
    },
    services: [
      s("consult", 400, "Consultation and check-up", "परामर्श और जाँच", "તપાસ અને સલાહ"),
      s("cleaning", 1200, "Cleaning and polishing", "दाँतों की सफ़ाई और पॉलिश", "દાંતની સફાઈ અને પૉલિશ"),
      s("filling", 1500, "Tooth filling", "दाँत की फिलिंग", "દાંતનું ફિલિંગ"),
      s("rct", 3500, "Root canal (first sitting)", "रूट कैनाल (पहली सिटिंग)", "રૂટ કેનાલ (પહેલી સિટિંગ)"),
      s("braces", 500, "Braces or aligner consultation", "ब्रेसेस / अलाइनर परामर्श", "બ્રેસીસ / અલાઇનર સલાહ"),
    ],
    sampleNotes: [
      "Sensitivity upper right. X-ray taken, deep caries on 16. Advised filling, explained cost.",
      "Scaling done. Mild bleeding gums, advised soft brush and warm salt rinse for a week.",
      "RCT first sitting on 36 completed. Temporary filling placed. Next sitting in 5 days.",
      "Composite filling on 25. Bite checked. No complaints.",
      "Aligner consult. Impressions taken, will share plan and quote on next visit.",
    ],
  },
  physio: {
    name: "Serenity Physiotherapy",
    doctor: "Dr. Hetal Rana (PT)",
    qualification: "BPT, MPT (Orthopaedics)",
    regNo: "GSCPT 2291",
    years: 11,
    slotMinutes: 30,
    kind: { en: "Physiotherapy clinic", hi: "फ़िज़ियोथेरेपी क्लिनिक", gu: "ફિઝિયોથેરાપી ક્લિનિક" },
    quote: {
      en: "Pain that has lasted months rarely goes in one sitting. I give you a plan with a number of sessions and exercises you can do at home.",
      hi: "महीनों पुराना दर्द एक सेशन में नहीं जाता। हम आपको सेशन की गिनती के साथ पूरा प्लान और घर पर करने की कसरतें देते हैं।",
      gu: "મહિનાઓ જૂનો દુખાવો એક સેશનમાં જતો નથી. અમે તમને સેશનની સંખ્યા સાથે આખો પ્લાન અને ઘરે કરવાની કસરતો આપીએ છીએ.",
    },
    bring: {
      en: "X-ray or MRI reports, and loose, comfortable clothes.",
      hi: "एक्स-रे या एमआरआई रिपोर्ट, और ढीले आरामदायक कपड़े।",
      gu: "એક્સ-રે કે એમઆરઆઈ રિપોર્ટ, અને ઢીલાં આરામદાયક કપડાં.",
    },
    services: [
      s("assess", 600, "First assessment", "पहली जाँच", "પહેલી તપાસ"),
      s("followup", 500, "Follow-up session", "फ़ॉलो-अप सेशन", "ફૉલો-અપ સેશન"),
      s("spine", 700, "Back and neck pain session", "कमर और गर्दन दर्द का सेशन", "કમર અને ગરદનના દુખાવાનું સેશન"),
      s("sports", 800, "Sports injury rehab", "खेल की चोट का रिहैब", "રમતની ઈજાનું રિહેબ"),
      s("postop", 800, "Post-surgery rehab", "ऑपरेशन के बाद का रिहैब", "ઑપરેશન પછીનું રિહેબ"),
    ],
    sampleNotes: [
      "Low back pain 3 months, worse on sitting. SLR negative. Started core activation, 6 sessions planned.",
      "Session 3 of 6. Pain down from 7 to 4. Added bridging and cat-camel for home.",
      "Frozen shoulder (R). Abduction 90°. Mobilisation and pendulum exercises, review in a week.",
      "Post ACL repair week 5. Flexion 110°. Progressed to closed-chain work.",
      "Cervical spondylosis. IFT and traction. Posture advice for desk work.",
    ],
  },
  skin: {
    name: "Serenity Skin Clinic",
    doctor: "Dr. Aditi Bhatt",
    qualification: "MBBS, MD (Dermatology)",
    regNo: "GMC G-38214",
    years: 9,
    slotMinutes: 20,
    kind: { en: "Skin clinic", hi: "त्वचा क्लिनिक", gu: "ત્વચા ક્લિનિક" },
    quote: {
      en: "Skin takes six to eight weeks to respond, so I would rather be honest about the timeline than promise a quick fix. Bring whatever creams you use now.",
      hi: "त्वचा को असर दिखाने में छह से आठ हफ़्ते लगते हैं, इसलिए हम झूठा वादा नहीं करते, सही समय बताते हैं। अभी जो क्रीम लगा रहे हैं, साथ ले आइए।",
      gu: "ત્વચાને અસર દેખાડતાં છથી આઠ અઠવાડિયાં લાગે છે, એટલે અમે ખોટું વચન નથી આપતા, સાચો સમય કહીએ છીએ. હાલ જે ક્રીમ લગાવો છો તે સાથે લાવજો.",
    },
    bring: {
      en: "The creams and medicines you use now.",
      hi: "अभी जो क्रीम और दवाइयाँ ले रहे हैं।",
      gu: "હાલ જે ક્રીમ અને દવાઓ વાપરો છો તે.",
    },
    services: [
      s("consult", 600, "Skin consultation", "त्वचा परामर्श", "ત્વચાની તપાસ"),
      s("followup", 400, "Follow-up visit", "फ़ॉलो-अप", "ફૉલો-અપ"),
      s("acne", 700, "Acne care visit", "मुँहासों का इलाज", "ખીલની સારવાર"),
      s("hair", 700, "Hair fall consultation", "बाल झड़ने का परामर्श", "વાળ ખરવાની સલાહ"),
      s("peel", 1800, "Chemical peel", "केमिकल पील", "કેમિકલ પીલ"),
    ],
    sampleNotes: [
      "Grade 2 acne, cheeks and forehead. Started adapalene at night, sunscreen daily. Review in 6 weeks.",
      "Hair fall 4 months after typhoid. Likely telogen effluvium. Bloods advised.",
      "Tinea on trunk. Stopped steroid cream from chemist. Antifungal for 4 weeks.",
      "Peel session 2. Mild redness, settled in clinic. Strict sun protection.",
      "Follow-up. Pigmentation lighter. Continue same, add vitamin C serum in the morning.",
    ],
  },
  child: {
    name: "Serenity Child Clinic",
    doctor: "Dr. Parth Desai",
    qualification: "MBBS, MD (Paediatrics)",
    regNo: "GMC G-29760",
    years: 16,
    slotMinutes: 20,
    kind: { en: "Children's clinic", hi: "बच्चों का क्लिनिक", gu: "બાળકોનું દવાખાનું" },
    quote: {
      en: "Parents usually know when something is not right. Tell me what you have noticed, and bring the vaccination card.",
      hi: "माता-पिता को अक्सर पता चल जाता है कि कुछ ठीक नहीं है। आपने जो देखा है वह बताइए, और टीकाकरण कार्ड साथ लाइए।",
      gu: "માતા-પિતાને મોટેભાગે ખબર પડી જાય છે કે કંઈક બરાબર નથી. તમે જે જોયું છે તે કહો, અને રસીકરણ કાર્ડ સાથે લાવજો.",
    },
    bring: {
      en: "The vaccination card and any old prescriptions.",
      hi: "टीकाकरण कार्ड और पुराने पर्चे।",
      gu: "રસીકરણ કાર્ડ અને જૂનાં પ્રિસ્ક્રિપ્શન.",
    },
    services: [
      s("consult", 500, "Consultation", "परामर्श", "તપાસ"),
      s("followup", 200, "Follow-up (within 5 days)", "फ़ॉलो-अप (5 दिन के अंदर)", "ફૉલો-અપ (5 દિવસની અંદર)"),
      s("vaccine", 300, "Vaccination visit (vaccine extra)", "टीकाकरण (टीके का दाम अलग)", "રસીકરણ (રસીનો ખર્ચ અલગ)"),
      s("newborn", 600, "Newborn check", "नवजात शिशु की जाँच", "નવજાત બાળકની તપાસ"),
      s("growth", 500, "Growth and nutrition review", "विकास और पोषण की जाँच", "વિકાસ અને પોષણની તપાસ"),
    ],
    sampleNotes: [
      "Fever 2 days, cough. Chest clear. Paracetamol by weight, fluids. Review if fever past day 4.",
      "9-month vaccines given (MR 1, JE 1). Weight 8.4 kg, on track.",
      "Loose stools 3 days. No dehydration. ORS and zinc for 14 days.",
      "Newborn day 6. Feeding well, weight regained. Mild jaundice, sunlight advice, recheck in 3 days.",
      "Growth review. Height and weight on 25th centile. Diet chart given.",
    ],
  },
  general: {
    name: "Serenity Family Clinic",
    doctor: "Dr. Sameer Trivedi",
    qualification: "MBBS, MD (Medicine)",
    regNo: "GMC G-21483",
    years: 19,
    slotMinutes: 20,
    kind: { en: "Family clinic", hi: "फ़ैमिली क्लिनिक", gu: "ફેમિલી ક્લિનિક" },
    quote: {
      en: "I see the same families year after year, so I would rather understand the whole picture than rush. Bring your old reports and the medicines you take.",
      hi: "हम सालों से उन्हीं परिवारों को देखते आए हैं, इसलिए जल्दबाज़ी नहीं करते, पूरी बात समझते हैं। पुरानी रिपोर्ट और चल रही दवाइयाँ साथ लाइए।",
      gu: "અમે વર્ષોથી એ જ પરિવારોને જોઈએ છીએ, એટલે ઉતાવળ નથી કરતા, આખી વાત સમજીએ છીએ. જૂના રિપોર્ટ અને ચાલુ દવાઓ સાથે લાવજો.",
    },
    bring: {
      en: "Old reports and the medicines you take.",
      hi: "पुरानी रिपोर्ट और चल रही दवाइयाँ।",
      gu: "જૂના રિપોર્ટ અને ચાલુ દવાઓ.",
    },
    services: [
      s("consult", 300, "Consultation", "परामर्श", "તપાસ"),
      s("followup", 150, "Follow-up", "फ़ॉलो-अप", "ફૉલો-અપ"),
      s("chronic", 400, "Diabetes or BP review", "डायबिटीज़ / बीपी की जाँच", "ડાયાબિટીસ / બીપીની તપાસ"),
      s("checkup", 500, "Health check-up", "हेल्थ चेक-अप", "હેલ્થ ચેક-અપ"),
      s("fever", 300, "Fever and infection visit", "बुखार और संक्रमण", "તાવ અને ચેપ"),
    ],
    sampleNotes: [
      "Fever 3 days with body ache. Dengue NS1 and CBC sent. Fluids, paracetamol. Review with reports.",
      "BP 148/92 on amlodipine 5. Dose kept, salt advice. Recheck in 2 weeks.",
      "FBS 162, HbA1c 7.9. Metformin increased. Diet and evening walk discussed.",
      "Acidity and bloating 2 weeks. PPI for 14 days, avoid late dinners.",
      "Annual check-up. Lipids borderline. Repeat in 3 months after diet changes.",
    ],
  },
};

const CONDITIONS: Record<Specialty, [string, string, string][]> = {
  dental: [["Toothache", "दाँत का दर्द", "દાંતનો દુખાવો"], ["Bleeding gums", "मसूड़ों से ख़ून", "પેઢામાંથી લોહી"], ["Cavities", "कैविटी", "દાંતમાં સડો"], ["Sensitive teeth", "दाँतों में झनझनाहट", "દાંતમાં કળતર"], ["Crooked teeth", "टेढ़े-मेढ़े दाँत", "વાંકાચૂકા દાંત"], ["Bad breath", "मुँह की बदबू", "મોંની દુર્ગંધ"], ["Missing tooth", "टूटा या गिरा दाँत", "પડી ગયેલો દાંત"], ["Stained teeth", "पीले दाँत", "પીળા દાંત"]],
  physio: [["Back pain", "कमर दर्द", "કમરનો દુખાવો"], ["Neck pain", "गर्दन दर्द", "ગરદનનો દુખાવો"], ["Knee pain", "घुटने का दर्द", "ઘૂંટણનો દુખાવો"], ["Frozen shoulder", "फ़्रोज़न शोल्डर", "ફ્રોઝન શોલ્ડર"], ["Sciatica", "सायटिका", "સાયટિકા"], ["Sports injury", "खेल की चोट", "રમતની ઈજા"], ["After surgery", "ऑपरेशन के बाद", "ઑપરેશન પછી"], ["Slipped disc", "स्लिप डिस्क", "સ્લિપ ડિસ્ક"]],
  skin: [["Acne", "मुँहासे", "ખીલ"], ["Hair fall", "बाल झड़ना", "વાળ ખરવા"], ["Pigmentation", "झाइयाँ", "પિગમેન્ટેશન"], ["Fungal infection", "फंगल संक्रमण", "ફંગલ ચેપ"], ["Eczema", "एक्ज़िमा", "ખરજવું"], ["Dandruff", "रूसी", "ખોડો"], ["Allergy and rashes", "एलर्जी और चकत्ते", "એલર્જી અને ચકામાં"], ["Warts and moles", "मस्से और तिल", "મસા અને તલ"]],
  child: [["Fever", "बुखार", "તાવ"], ["Cough and cold", "खाँसी-ज़ुकाम", "ઉધરસ-શરદી"], ["Vaccination", "टीकाकरण", "રસીકરણ"], ["Loose motions", "दस्त", "ઝાડા"], ["Newborn care", "नवजात की देखभाल", "નવજાતની સંભાળ"], ["Poor weight gain", "वज़न न बढ़ना", "વજન ન વધવું"], ["Allergies", "एलर्जी", "એલર્જી"], ["Asthma", "दमा", "દમ"]],
  general: [["Fever", "बुखार", "તાવ"], ["Diabetes", "डायबिटीज़", "ડાયાબિટીસ"], ["Blood pressure", "ब्लड प्रेशर", "બ્લડ પ્રેશર"], ["Thyroid", "थायरॉइड", "થાઇરોઇડ"], ["Acidity", "एसिडिटी", "એસિડિટી"], ["Cough and cold", "खाँसी-ज़ुकाम", "ઉધરસ-શરદી"], ["Dengue and malaria", "डेंगू और मलेरिया", "ડેન્ગ્યુ અને મલેરિયા"], ["Body pain", "बदन दर्द", "શરીરનો દુખાવો"]],
};

const ALIASES: Record<string, Specialty> = {
  dental: "dental", dentist: "dental", dentistry: "dental", teeth: "dental",
  physio: "physio", physiotherapy: "physio", physiotherapist: "physio", rehab: "physio",
  skin: "skin", derma: "skin", dermatology: "skin", dermatologist: "skin",
  child: "child", children: "child", kids: "child", paediatric: "child", pediatric: "child",
  paediatrics: "child", pediatrics: "child", paediatrician: "child", pediatrician: "child",
  general: "general", gp: "general", physician: "general", family: "general",
};

export const SPECIALTIES: { id: Specialty; label: string }[] = [
  { id: "dental", label: "Dental" },
  { id: "physio", label: "Physiotherapy" },
  { id: "skin", label: "Skin" },
  { id: "child", label: "Child care" },
  { id: "general", label: "General practice" },
];

export function pickParams(sp: Record<string, string | string[] | undefined>): ClinicParams {
  const out: ClinicParams = {};
  for (const k of PARAM_KEYS) {
    const v = sp[k];
    const str = (Array.isArray(v) ? v[0] : v)?.trim();
    if (str) out[k] = str.slice(0, 80);
  }
  return out;
}

export function toQuery(params: ClinicParams): string {
  const q = new URLSearchParams();
  for (const k of PARAM_KEYS) if (params[k]) q.set(k, params[k]!);
  const str = q.toString();
  return str ? "?" + str : "";
}

export function buildClinic(params: ClinicParams): Clinic {
  const specialty = ALIASES[(params.specialty ?? "").toLowerCase()] ?? "dental";
  const preset = PRESETS[specialty];
  const digits = (params.phone ?? "").replace(/\D/g, "").slice(-10);
  return {
    ...preset,
    services: preset.services.map((x) => {
      const [en, hi, gu] = ABOUT[specialty][x.id];
      return { ...x, about: { en, hi, gu } };
    }),
    specialty,
    name: params.clinic ?? preset.name,
    doctor: params.doctor ?? preset.doctor,
    area: params.area ?? "Alkapuri",
    city: "Vadodara",
    phone: digits.length === 10 ? digits : null,
    hours: HOURS,
    photos: [1, 2, 3, 4].map((n) => `/media/${specialty}-${n}.jpg`).concat([1, 2, 3, 4].map((n) => `/media/space-${n}.jpg`)),
    conditions: CONDITIONS[specialty].map(([en, hi, gu]) => ({ en, hi, gu })),
    patientsSeen: Math.round((preset.years * 850) / 500) * 500,
    rating: 4.9,
  };
}

export function serviceById(clinic: Clinic, id: string): Service {
  return clinic.services.find((x) => x.id === id) ?? clinic.services[0];
}

export function rupees(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export function formatPhone(ten: string): string {
  return `+91 ${ten.slice(0, 5)} ${ten.slice(5)}`;
}
