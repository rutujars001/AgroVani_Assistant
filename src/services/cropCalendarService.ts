import { CropCalendarTask, FarmerProfile, CropGrowthStage } from '../types';
import { securityService } from './securityService';

const STORAGE_KEY_COMPLETED_TASKS = 'agrovani_calendar_completed_tasks';
const STORAGE_KEY_CUSTOM_CROP_DAYS = 'agrovani_crop_custom_days';

export interface StageDefinition {
  stageName: string;
  minDays: number;
  maxDays: number;
  healthAdvisory: string;
  tasks: {
    category: 'पाणी (Irrigation)' | 'खत (Fertilizer)' | 'फवारणी (Spray)' | 'मशागत (Field Work)' | 'काढणी (Harvest)';
    title: string;
    description: string;
    timing: string;
    priority: 'उच्च (High)' | 'मध्यम (Medium)' | 'नियमित (Regular)';
    audioText: string;
  }[];
}

export interface CropGrowthCycle {
  cropName: string;
  cropIcon: string;
  totalDurationDays: number;
  stages: StageDefinition[];
}

// Comprehensive scientific growth cycles adapted for Solapur & Maharashtra farmers
export const CROP_CYCLES: Record<string, CropGrowthCycle> = {
  'डाळिंब': {
    cropName: 'डाळिंब',
    cropIcon: '🍎',
    totalDurationDays: 160,
    stages: [
      {
        stageName: 'बहार नियोजन व छाटणी (दिवस १ ते २०)',
        minDays: 1,
        maxDays: 20,
        healthAdvisory: 'झाडांना विश्रांतीनंतर ताण तोडताना हलके पाणी द्यावे व खोडाला बोर्डो पेस्ट लावावी.',
        tasks: [
          {
            category: 'मशागत (Field Work)',
            title: 'झाडांची छाटणी व स्वच्छता',
            description: 'वाळलेल्या, रोगट व तेल्याग्रस्त फांद्या कापून नष्ट करा. कापलेल्या भागावर १०% बोर्डो पेस्ट लावा.',
            timing: 'सकाळी ७ ते १० च्या दरम्यान',
            priority: 'उच्च (High)',
            audioText: 'डाळिंबाच्या बागेतील वाळलेल्या आणि रोगट फांद्या कापून त्यावर बोर्डो पेस्ट लावा.'
          },
          {
            category: 'खत (Fertilizer)',
            title: 'शेणखत व बेसल डोस नियोजन',
            description: 'प्रति झाड २० किलो चांगले कुजलेले शेणखत, १ किलो सिंगल सुपर फॉस्फेट आणि २५० ग्रॅम पोटॅश द्या.',
            timing: 'संध्याकाळी ४ नंतर',
            priority: 'मध्यम (Medium)',
            audioText: 'झाडांच्या मुळांपाशी शेणखत आणि सिंगल सुपर फॉस्फेटचा बेसल डोस द्या.'
          }
        ]
      },
      {
        stageName: 'फुलोरा व परागीभवन टप्पा (दिवस २१ ते ५०)',
        minDays: 21,
        maxDays: 50,
        healthAdvisory: 'फुलोऱ्याच्या काळात जास्त पाणी देऊ नका, अन्यथा फुलगळ होण्याची शक्यता असते.',
        tasks: [
          {
            category: 'पाणी (Irrigation)',
            title: 'मोजके व नियमित ठिबक सिंचन',
            description: 'फुलोरा अवस्थेत जमिनीतील ओलावा कायम ठेवा, अतिपाणी टाळा. दररोज प्रति झाड १५ ते २० लिटर पाणी पुरेसे आहे.',
            timing: 'सकाळी ८ च्या आत',
            priority: 'उच्च (High)',
            audioText: 'डाळिंबाला फुलोरा अवस्थेत जास्त पाणी देऊ नका, अन्यथा फुलगळ होईल. मोजकेच पाणी द्या.'
          },
          {
            category: 'फवारणी (Spray)',
            title: 'फुलगळ थांबवणे व कीड नियंत्रण',
            description: 'फुलकळी वाढवण्यासाठी १२:६१:०० (५ ग्रॅम/लिटर) + बोरॉन (१ ग्रॅम/लिटर) फवारा. थ्रिप्ससाठी निंबोळी तेल वापरा.',
            timing: 'संध्याकाळी ५ नंतर',
            priority: 'उच्च (High)',
            audioText: 'फुलगळ रोखण्यासाठी बोरॉन आणि १२ ६१ शून्य ची संध्याकाळी फवारणी करा.'
          }
        ]
      },
      {
        stageName: 'फळ धारणा व विकास (दिवस ५१ ते ९५)',
        minDays: 51,
        maxDays: 95,
        healthAdvisory: 'फळांचा आकार लिंबाएवढा झाल्यावर तेल्या रोगाचे आणि फळमाशीचे नियमित निरीक्षण करा.',
        tasks: [
          {
            category: 'फवारणी (Spray)',
            title: 'तेल्या रोग प्रतिबंधक फवारणी',
            description: 'सोलापूरच्या कोरड्या व उष्ण हवेत कॉपर ऑक्सिक्लोराईड २.५ ग्रॅम + स्ट्रेप्टोसायक्लिन ०.५ ग्रॅम प्रति लिटर फवारा.',
            timing: 'सकाळी ७ ते ९ किंवा संध्याकाळी',
            priority: 'उच्च (High)',
            audioText: 'तेल्या रोग रोखण्यासाठी कॉपर ऑक्सिक्लोराईड आणि स्ट्रेप्टोसायक्लिनची तातडीने फवारणी करा.'
          },
          {
            category: 'खत (Fertilizer)',
            title: 'फळ फुगवणीसाठी १३:००:४५ खत',
            description: 'ठिबक सिंचनाद्वारे आठवड्यातून दोनदा पोटॅशियम नायट्रेट (१३:००:४५) एकरी ३ किलो सोडावे.',
            timing: 'संध्याकाळी सिंचनासोबत',
            priority: 'मध्यम (Medium)',
            audioText: 'फळांची योग्य वाढ होण्यासाठी ठिबकमधून १३ शून्य ४५ हे विद्राव्य खत सोडा.'
          },
          {
            category: 'मशागत (Field Work)',
            title: 'फळ पोखरणारी सुरवंट सापळे तपासणी',
            description: 'बागेत एकरी ४ कामगंध सापळे (फेरोमोन ट्रॅप) लावा व त्यात अडकलेल्या पतंगांची पाहणी करा.',
            timing: 'सकाळी',
            priority: 'नियमित (Regular)',
            audioText: 'डाळिंब बागेत कामगंध सापळ्यांची पाहणी करून अडकलेले पतंग नष्ट करा.'
          }
        ]
      },
      {
        stageName: 'फळ फुगवण, रंग व गोडी (दिवस ९६ ते १४०)',
        minDays: 96,
        maxDays: 140,
        healthAdvisory: 'फळांना उन्हाचा चटका बसू नये म्हणून सनबर्न नेट किंवा पेपर बॅगिंग करावे.',
        tasks: [
          {
            category: 'पाणी (Irrigation)',
            title: 'एकसारखे पाणी देणे (फळ तडकणे टाळा)',
            description: 'जमिनीला पाण्याचा ताण पडून एकदम जास्त पाणी दिल्यास डाळिंब तडकतात. ठिबक नियमित चालू ठेवा.',
            timing: 'दररोज नियमित वेळी',
            priority: 'उच्च (High)',
            audioText: 'पाण्याचा ताण पडू देऊ नका, अन्यथा डाळिंबे तडकतील. नियमित ठिबक चालू ठेवा.'
          },
          {
            category: 'खत (Fertilizer)',
            title: '००:००:५० (एसओपी) व कॅल्शियम नायट्रेट',
            description: 'फळांना चकाकी व लालभडक रंग येण्यासाठी ००:००:५० पोटॅशियम सल्फेट एकरी ५ किलो सोडा.',
            timing: 'संध्याकाळी',
            priority: 'मध्यम (Medium)',
            audioText: 'डाळिंबाला चांगला लाल रंग आणि गोडी येण्यासाठी डबल शून्य पन्नास खत द्या.'
          },
          {
            category: 'मशागत (Field Work)',
            title: 'फळांना पेपर बॅगिंग (आवरण घालणे)',
            description: 'उन्हापासून आणि डास-माशीच्या दंशापासून संरक्षणासाठी बटर पेपरच्या पिशव्या फळांवर चढवा.',
            timing: 'दिवसभरात कधीही',
            priority: 'मध्यम (Medium)',
            audioText: 'फळांना उन्हाचा चटका बसू नये म्हणून बटर पेपरच्या पिशव्या चढवून बॅगिंग करा.'
          }
        ]
      },
      {
        stageName: 'परिपक्वता व काढणी (दिवस १४१ ते १६०)',
        minDays: 141,
        maxDays: 160,
        healthAdvisory: 'काढणीपूर्वी १० दिवस कीटकनाशकांची फवारणी बंद ठेवावी.',
        tasks: [
          {
            category: 'काढणी (Harvest)',
            title: 'भगवा डाळिंबाची योग्य वेळी काढणी',
            description: 'फळाचा तळ सपाट झाल्यावर आणि विशिष्ट चकाकणारा लाल रंग आल्यावर कात्रीने देठासह कापा.',
            timing: 'सकाळी थंड हवेत (८ ते ११)',
            priority: 'उच्च (High)',
            audioText: 'काढणी करताना फळे हाताने ओढू नका, धारदार कात्रीने देठाजवळून अलगद कापा.'
          },
          {
            category: 'मशागत (Field Work)',
            title: 'दर्जानुसार प्रतवारी (Grading & Packing)',
            description: 'फळांचे वजन २५० ग्रॅमपेक्षा जास्त असलेले सुपर क्वॉलिटी डाळिंब वेगळे करून क्रेट्समध्ये भरा.',
            timing: 'सावलीत',
            priority: 'मध्यम (Medium)',
            audioText: 'सोलापूर मार्केट किंवा निर्यातीसाठी फळांची योग्य प्रतवारी करा.'
          }
        ]
      }
    ]
  },

  'कांदा': {
    cropName: 'कांदा',
    cropIcon: '🧅',
    totalDurationDays: 120,
    stages: [
      {
        stageName: 'रोपे लागवड व मूळ धरणे (दिवस १ ते २०)',
        minDays: 1,
        maxDays: 20,
        healthAdvisory: 'रोपे पुनर्लागवड करताना ट्रायकोडर्मा किंवा कार्बोसल्फानच्या द्रावणात बुडवून लावावीत.',
        tasks: [
          {
            category: 'पाणी (Irrigation)',
            title: 'लागवडीनंतर आंबवणी व चिंबवणी',
            description: 'कांदा लागवडीनंतर तिसऱ्या किंवा चौथ्या दिवशी हलके पाणी (आंबवणी) द्या जेणेकरून मुळे घट्ट पकडतील.',
            timing: 'सकाळी किंवा संध्याकाळी',
            priority: 'उच्च (High)',
            audioText: 'कांदा लागवडीनंतर आंबवणीचे हलके पाणी द्या, त्यामुळे रोपांची मुळे चांगली फुटतील.'
          },
          {
            category: 'मशागत (Field Work)',
            title: 'तण नियंत्रण व नांग्या भरणे',
            description: 'वाळलेली रोपे काढून नवीन रोपे लावा आणि सुरुवातीचे तण उपटून शेत स्वच्छ ठेवा.',
            timing: 'सकाळी',
            priority: 'मध्यम (Medium)',
            audioText: 'मेलेली रोपे काढून नवीन रोपे लावा आणि नांग्या भरून घ्या.'
          }
        ]
      },
      {
        stageName: 'शाकीय वाढ व पात फुटणे (दिवस २१ ते ५०)',
        minDays: 21,
        maxDays: 50,
        healthAdvisory: 'थ्रिप्स (फुलकिडे) मुळे पातीवर पांढरे ठिपके पडतात, त्वरित निंबोळी अर्क किंवा कीटकनाशक वापरा.',
        tasks: [
          {
            category: 'फवारणी (Spray)',
            title: 'थ्रिप्स व करपा प्रतिबंधक फवारणी',
            description: 'फिप्रोनिल (२ मिली/लिटर) किंवा प्रोफेनोफॉस + सायपरमेथ्रिन सोबत मँकोझेब (२.५ ग्रॅम) आणि स्टिकर मिसळून फवारा.',
            timing: 'संध्याकाळी ५ नंतर',
            priority: 'उच्च (High)',
            audioText: 'कांद्याच्या पातीवरील करपा आणि थ्रिप्ससाठी मँकोझेब आणि फिप्रोनिलची फवारणी करा.'
          },
          {
            category: 'खत (Fertilizer)',
            title: 'युरिया व सल्फरचा पहिला हप्ता',
            description: 'एकरी २५ किलो युरिया आणि ५ किलो बेंटोनाइट सल्फर द्यावे. सल्फरमुळे कांद्याला चांगला तिखटपणा येतो.',
            timing: 'पाणी देण्यापूर्वी',
            priority: 'मध्यम (Medium)',
            audioText: 'कांद्याला एकरी २५ किलो युरिया आणि ५ किलो सल्फर टाकून पाणी द्या.'
          }
        ]
      },
      {
        stageName: 'कांदा पोसणे / गड्डा भरणे (दिवस ५१ ते ९०)',
        minDays: 51,
        maxDays: 90,
        healthAdvisory: 'या काळात नत्राचा (युरिया) वापर पूर्णपणे बंद करावा, अन्यथा कांदा पोकळ होतो व डेंगळे येतात.',
        tasks: [
          {
            category: 'खत (Fertilizer)',
            title: '०:५२:३४ + बोरॉनची फवारणी',
            description: 'कांदा मोठा व वजनदार होण्यासाठी ०:५२:३४ (५ ग्रॅम/लिटर) अधिक बोरॉन (१ ग्रॅम/लिटर) फवारा.',
            timing: 'सकाळी ९ च्या आत',
            priority: 'उच्च (High)',
            audioText: 'कांद्याचा गड्डा फुगण्यासाठी शून्य बावन्न चौतीस आणि बोरॉनची फवारणी करा.'
          },
          {
            category: 'पाणी (Irrigation)',
            title: 'नियमित ६ ते ८ दिवसांनी पाणी व्यवस्थापन',
            description: 'जमीन भेगाळू देऊ नका. हलके व नियमित पाणी दिल्याने कांदा फुटत नाही आणि जोड कांदा होत नाही.',
            timing: 'सकाळी किंवा संध्याकाळी',
            priority: 'मध्यम (Medium)',
            audioText: 'कांद्याला नियमित पाणी द्या. जमीन जास्त वाळू देऊ नका.'
          }
        ]
      },
      {
        stageName: 'परिपक्वता व मान मोडणे (दिवस ९१ ते ११०)',
        minDays: 91,
        maxDays: 110,
        healthAdvisory: '५०% पाती आडव्या पडल्यावर (मान मोडल्यावर) काढणीची तयारी करावी.',
        tasks: [
          {
            category: 'पाणी (Irrigation)',
            title: 'काढणीपूर्वी १० दिवस पाणी पूर्ण बंद करा',
            description: 'कांदा काढणीपूर्वी १० ते १५ दिवस पाणी बंद केल्यास कांद्याची साठवण क्षमता (टिकवण) वाढते.',
            timing: 'तातडीने',
            priority: 'उच्च (High)',
            audioText: 'कांदा टिकण्यासाठी काढणीच्या किमान दहा दिवस आधी शेताचे पाणी पूर्णपणे बंद करा.'
          },
          {
            category: 'खत (Fertilizer)',
            title: '००:००:५० फवारणी (रंग व कडकपणासाठी)',
            description: 'पोटॅशियम सल्फेट (००:००:५०) ५ ग्रॅम प्रति लिटर फवारल्याने कांद्याला आकर्षक लाल रंग येतो.',
            timing: 'सकाळी',
            priority: 'नियमित (Regular)',
            audioText: 'कांद्याला लालभडक रंग येण्यासाठी शून्य शून्य पन्नासची फवारणी करा.'
          }
        ]
      },
      {
        stageName: 'काढणी व सुकवणे (दिवस १११ ते १२०)',
        minDays: 111,
        maxDays: 120,
        healthAdvisory: 'उन्हात कांदा सुकवताना पाती झाकून ठेवाव्यात जेणेकरून कांदा पांढरा पडणार नाही.',
        tasks: [
          {
            category: 'काढणी (Harvest)',
            title: 'कांदा उपटणी व शेतात सुकवणे',
            description: 'कांदा उपटून शेतातच ४ ते ५ दिवस पातीने गड्डा झाकून सुकवावा. नंतर २ सेंमी मान ठेवून कापावा.',
            timing: 'सकाळी',
            priority: 'उच्च (High)',
            audioText: 'कांदा उपटून शेतात काही दिवस सुकवा आणि दोन सेंटीमीटर मान ठेवून कापा.'
          }
        ]
      }
    ]
  },

  'ज्वारी': {
    cropName: 'ज्वारी',
    cropIcon: '🌾',
    totalDurationDays: 115,
    stages: [
      {
        stageName: 'उगवण व रोपावस्था (दिवस १ ते २५)',
        minDays: 1,
        maxDays: 25,
        healthAdvisory: 'खोदमाशी (Shoot Fly) मुळे मधला पोंगा वाळतो, पेरणीनंतर पहिल्या १० दिवसांत लक्ष ठेवा.',
        tasks: [
          {
            category: 'मशागत (Field Work)',
            title: 'विरळणी (Thining) व पहिली कोळपणी',
            description: 'पेरणीनंतर १५ दिवसांनी एका जागी एकच जोमदार रोप ठेवून विरळणी करा. पहिली हलकी कोळपणी करा.',
            timing: 'सकाळी',
            priority: 'उच्च (High)',
            audioText: 'ज्वारीच्या रोपांची वेळेवर विरळणी करा आणि पहिली कोळपणी करून तण काढा.'
          },
          {
            category: 'फवारणी (Spray)',
            title: 'खोडमाशी नियंत्रण',
            description: 'पोंगा वाळू नये म्हणून क्लोरपायरीफॉस २ मिली प्रति लिटर पाण्यात मिसळून फवारा.',
            timing: 'संध्याकाळी',
            priority: 'मध्यम (Medium)',
            audioText: 'खोडमाशीच्या नियंत्रणासाठी पोंग्यामध्ये औषधाची हलकी फवारणी करा.'
          }
        ]
      },
      {
        stageName: 'पोटरी व वाढ अवस्था (दिवस २६ ते ५०)',
        minDays: 26,
        maxDays: 50,
        healthAdvisory: 'दुसरी कोळपणी करून पिकाला मातीची भर लावावी जेणेकरून जमिनीत ओलावा टिकून राहील.',
        tasks: [
          {
            category: 'मशागत (Field Work)',
            title: 'दुसरी कोळपणी व मातीची भर',
            description: 'दातेरी कोळप्याने दुसरी कोळपणी करा. यामुळे भेगा बुजतात आणि बाष्पीभवन थांबते.',
            timing: 'सकाळी',
            priority: 'उच्च (High)',
            audioText: 'ज्वारीला दुसरी कोळपणी करून ओलावा टिकवून ठेवा.'
          },
          {
            category: 'खत (Fertilizer)',
            title: 'युरियाचा दुसरा हप्ता (पोटरी अवस्था)',
            description: 'पोटरीत कणीस तयार होताना एकरी ३० किलो युरिया देऊन जमिनीत ओलावा असताना पाणी द्या.',
            timing: 'पाणी देण्यापूर्वी',
            priority: 'मध्यम (Medium)',
            audioText: 'ज्वारी पोटरीत असताना एकरी ३० किलो युरियाचा हप्ता द्या.'
          }
        ]
      },
      {
        stageName: 'फुलोरा व कणीस बाहेर पडणे (दिवस ५१ ते ७०)',
        minDays: 51,
        maxDays: 70,
        healthAdvisory: 'हा पाण्याचा अत्यंत संवेदनशील टप्पा आहे. या काळात पाण्याचा ताण पडल्यास कणसातील दाणे पोचट राहतात.',
        tasks: [
          {
            category: 'पाणी (Irrigation)',
            title: 'फुलोऱ्याच्या वेळी अत्यंत महत्त्वाचे पाणी',
            description: 'कणसे बाहेर पडताना पाण्याची एक पाळी अवश्य द्या. यामुळे कणसात दाण्यांची संख्या वाढते.',
            timing: 'सकाळी किंवा संध्याकाळी',
            priority: 'उच्च (High)',
            audioText: 'कणीस बाहेर पडताना ज्वारीला पाणी देणे सर्वात महत्त्वाचे आहे.'
          }
        ]
      },
      {
        stageName: 'दाणे भरणे व चिकाची अवस्था (दिवस ७१ ते ९०)',
        minDays: 71,
        maxDays: 90,
        healthAdvisory: 'कणसात दूध भरताना पक्ष्यांचा उपद्रव होतो. गोफण किंवा ध्वनी यंत्राचा वापर करा.',
        tasks: [
          {
            category: 'मशागत (Field Work)',
            title: 'पक्ष्यांपासून कणसांचे संरक्षण',
            description: 'सकाळी सूर्योदयावेळी आणि संध्याकाळी पक्षी कणसे खातात. शेतात चमकी पट्ट्या व बुजगावणे लावा.',
            timing: 'सकाळी व संध्याकाळी',
            priority: 'उच्च (High)',
            audioText: 'ज्वारीच्या कणसांचे पक्ष्यांपासून संरक्षण करण्यासाठी शेतात चमकी पट्ट्या लावा.'
          },
          {
            category: 'पाणी (Irrigation)',
            title: 'दाणे भरताना शेवटचे हलके पाणी',
            description: 'दाणा टपोरा आणि चमकदार भरण्यासाठी शेवटचे हलके पाणी द्यावे.',
            timing: 'संध्याकाळी',
            priority: 'नियमित (Regular)',
            audioText: 'दाणे भरण्याच्या वेळी जमिनीतील ओलाव्यानुसार शेवटचे हलके पाणी द्या.'
          }
        ]
      },
      {
        stageName: 'परिपक्वता व कापणी (दिवस ९१ ते ११५)',
        minDays: 91,
        maxDays: 115,
        healthAdvisory: 'कणसाच्या दाण्यावर काळा ठिपका (ब्लॅक स्पॉट) दिसल्यास ज्वारी पक्व झाली समजावी.',
        tasks: [
          {
            category: 'काढणी (Harvest)',
            title: 'मालदांडी ज्वारीची कापणी',
            description: 'कणसे कापून खळ्यावर किंवा ताडपत्रीवर उन्हात ४ दिवस चांगली वाळवून मळणी करा.',
            timing: 'उन्हात',
            priority: 'उच्च (High)',
            audioText: 'कणसे कापून उन्हात चांगली वाळवून मगच मळणी यंत्रातून ज्वारी काढा.'
          }
        ]
      }
    ]
  },

  'ऊस': {
    cropName: 'ऊस',
    cropIcon: '🎋',
    totalDurationDays: 360,
    stages: [
      {
        stageName: 'उगवण व फुटवे फुटणे (दिवस १ ते ४५)',
        minDays: 1,
        maxDays: 45,
        healthAdvisory: 'कांड कीड व खोडकीड (Early Shoot Borer) पासून ऊसाचे संरक्षण करा.',
        tasks: [
          {
            category: 'पाणी (Irrigation)',
            title: 'नियमित वाफसा पद्धतीचे पाणी',
            description: 'ठिबक सिंचनाने दररोज किंवा एक दिवसाआड २ तास पाणी देऊन वाफसा राखा.',
            timing: 'सकाळी ७ ते १०',
            priority: 'उच्च (High)',
            audioText: 'ऊसाला ठिबक सिंचनाने नियमित पाणी द्या आणि वाफसा राखा.'
          },
          {
            category: 'खत (Fertilizer)',
            title: '१९:१९:१९ व ह्युमिक ॲसिड ड्रीपद्वारे',
            description: 'मुळांचा विकास आणि फुटव्यांची संख्या वाढवण्यासाठी एकरी ५ किलो १९:१९:१९ आणि ५०० मिली ह्युमिक सोडा.',
            timing: 'संध्याकाळी',
            priority: 'मध्यम (Medium)',
            audioText: 'ऊसाला जास्त फुटवे फुटण्यासाठी एकोणीस एकोणीस एकोणीस खत सोडा.'
          }
        ]
      },
      {
        stageName: 'मोठी बाळबांधणी (दिवस ४६ ते ११०)',
        minDays: 46,
        maxDays: 110,
        healthAdvisory: 'बाळबांधणी करताना खतांचा संतुलित डोस मातीत गाडून पिकाला भर लावावी.',
        tasks: [
          {
            category: 'मशागत (Field Work)',
            title: 'मोठी बाळबांधणी व तण काढणे',
            description: 'ऊसाच्या दोन्ही बाजूने माती लावून सरी वरंबा बदला. यामुळे ऊस पडत नाही.',
            timing: 'सकाळी',
            priority: 'उच्च (High)',
            audioText: 'ऊसाला मोठी बाळबांधणी करून दोन्ही बाजूने मातीची भर लावा.'
          },
          {
            category: 'खत (Fertilizer)',
            title: 'युरिया, डीएपी आणि पोटॅश बेसल डोस',
            description: 'बांधणी करताना एकरी २ गोणी डीएपी, २ गोणी पोटॅश व १ गोणी युरिया मुळांपाशी गाडा.',
            timing: 'माती लावताना',
            priority: 'उच्च (High)',
            audioText: 'बाळबांधणीच्या वेळी डीएपी आणि पोटॅश खताची मात्रा मातीत गाडून द्या.'
          }
        ]
      },
      {
        stageName: 'कांडी सुटणे व जोमदार वाढ (दिवस १११ ते २४०)',
        minDays: 111,
        maxDays: 240,
        healthAdvisory: 'तांबेरा व पांढरी माशी रोगावर लक्ष ठेवा. वाळलेली पाचट काढून ओळीत पसरावी.',
        tasks: [
          {
            category: 'मशागत (Field Work)',
            title: 'वाळलेली पाचट काढणे (पाचट आच्छादन)',
            description: 'खालची वाळलेली ४ ते ५ पाने काढून दोन ओळींमध्ये पसरा. यामुळे ओलावा टिकतो व तण होत नाही.',
            timing: 'दिवसभरात कधीही',
            priority: 'मध्यम (Medium)',
            audioText: 'ऊसाची वाळलेली पाचट काढून शेतात ओळींमध्ये आच्छादन म्हणून पसरा.'
          },
          {
            category: 'खत (Fertilizer)',
            title: '१२:६१:०० व पोटॅशियम शोनाइट',
            description: 'कांड्यांची लांबी व जाडी वाढण्यासाठी ठिबकमधून विद्राव्य खतांचा नियमित वापर करा.',
            timing: 'संध्याकाळी',
            priority: 'नियमित (Regular)',
            audioText: 'कांड्या जाड होण्यासाठी ठिबकमधून विद्राव्य पोटॅश खत सोडा.'
          }
        ]
      },
      {
        stageName: 'पक्वता व तोडणी (दिवस २४१ ते ३६०)',
        minDays: 241,
        maxDays: 360,
        healthAdvisory: 'साखर उतारा वाढवण्यासाठी कारखान्याच्या तोडणी नोंदीनुसार तोडणी करावी.',
        tasks: [
          {
            category: 'काढणी (Harvest)',
            title: 'कारखाना तोडणी स्लिप नियोजन',
            description: 'ऊस तोडणी जमिनीलगत करावी, जेणेकरून खोडव्याला चांगले फुटवे येतात.',
            timing: 'दिवसभर',
            priority: 'उच्च (High)',
            audioText: 'ऊस तोडताना जमिनीलगत तोडा, जेणेकरून खोडवा चांगला फुटेल.'
          }
        ]
      }
    ]
  },

  'कापूस': {
    cropName: 'कापूस',
    cropIcon: '☁️',
    totalDurationDays: 150,
    stages: [
      {
        stageName: 'उगवण व वाढ (दिवस १ ते ३५)',
        minDays: 1,
        maxDays: 35,
        healthAdvisory: 'रस शोषणाऱ्या किडी (मावा, तुडतुडे, पांढरी माशी) यासाठी पिवळे व निळे चिकट सापळे लावा.',
        tasks: [
          {
            category: 'फवारणी (Spray)',
            title: 'रस शोषणाऱ्या किडींवर ५% निंबोळी अर्क',
            description: 'सुरुवातीला रासायनिक ऐवजी ५% निंबोळी अर्क फवारल्याने मित्र कीटकांचे संरक्षण होते.',
            timing: 'संध्याकाळी ५ नंतर',
            priority: 'उच्च (High)',
            audioText: 'रस शोषणाऱ्या किडींसाठी निंबोळी अर्काची संध्याकाळी फवारणी करा.'
          },
          {
            category: 'मशागत (Field Work)',
            title: 'पहिली व दुसरी कोळपणी',
            description: 'तण नियंत्रण आणि माती भुसभुशीत ठेवण्यासाठी नियमित कोळपणी करा.',
            timing: 'सकाळी',
            priority: 'मध्यम (Medium)',
            audioText: 'कापूस शेतात कोळपणी करून तण काढून टाका.'
          }
        ]
      },
      {
        stageName: 'पाते धरणे व फुलोरा (दिवस ३६ ते ७५)',
        minDays: 36,
        maxDays: 75,
        healthAdvisory: 'गुलाबी बोंडअळीच्या सर्वेक्षणासाठी एकरी ५ कामगंध सापळे (फेरोमोन ट्रॅप) लावा.',
        tasks: [
          {
            category: 'मशागत (Field Work)',
            title: 'गुलाबी बोंडअळी सापळे तपासणी',
            description: 'दररोज कामगंध सापळ्यातील पतंग तपासा. सलग ३ दिवस ८ पेक्षा जास्त पतंग आढळल्यास फवारणी करा.',
            timing: 'सकाळी',
            priority: 'उच्च (High)',
            audioText: 'गुलाबी बोंडअळीचे फेरोमोन ट्रॅप तपासा आणि पतंग मोजा.'
          },
          {
            category: 'फवारणी (Spray)',
            title: 'पातेगळ रोखण्यासाठी बोरॉन व १३:०४:४५',
            description: 'पाते आणि फुले गळू नयेत म्हणून बोरॉन (१ ग्रॅम/लिटर) अधिक प्लॅनोफिक्स (०.२५ मिली/लिटर) फवारा.',
            timing: 'संध्याकाळी',
            priority: 'उच्च (High)',
            audioText: 'कापसाची पातेगळ रोखण्यासाठी बोरॉन आणि १३ शून्य ४५ ची फवारणी करा.'
          }
        ]
      },
      {
        stageName: 'बोंडे भरणे व पक्वता (दिवस ७६ ते १२०)',
        minDays: 76,
        maxDays: 120,
        healthAdvisory: 'बोंडांवर रोसेट फुले दिसल्यास ती तोडून नष्ट करा.',
        tasks: [
          {
            category: 'फवारणी (Spray)',
            title: 'इमामेक्टिन बेन्झोएट (प्रोक्लेम) फवारणी',
            description: 'बोंडअळीचा प्रादुर्भाव रोखण्यासाठी प्रोक्लेम ०.५ ग्रॅम प्रति लिटर पाण्यात फवारा.',
            timing: 'संध्याकाळी',
            priority: 'उच्च (High)',
            audioText: 'बोंडअळीच्या नियंत्रणासाठी प्रोक्लेम कीटकनाशक फवारा.'
          },
          {
            category: 'खत (Fertilizer)',
            title: '००:००:५० फवारणी बोंडांच्या आकारासाठी',
            description: 'बोंडे टपोरी होण्यासाठी आणि रुईची प्रत सुधारण्यासाठी ००:००:५० खताची फवारणी करा.',
            timing: 'सकाळी',
            priority: 'मध्यम (Medium)',
            audioText: 'बोंडे टपोरी होण्यासाठी पोटॅशयुक्त खताची फवारणी करा.'
          }
        ]
      },
      {
        stageName: 'वेचणी (दिवस १२१ ते १५०)',
        minDays: 121,
        maxDays: 150,
        healthAdvisory: 'कापूस वेचणी करताना काडी-कचरा व सुकी पाने येणार नाहीत याची दक्षता घ्या.',
        tasks: [
          {
            category: 'काढणी (Harvest)',
            title: 'स्वच्छ कापूस वेचणी',
            description: 'दव सुकल्यानंतर सकाळी १० ते दुपारी ४ या वेळेत कापूस वेचावा. सुती कापडात गोळा करावा.',
            timing: 'दव सुकल्यानंतर',
            priority: 'उच्च (High)',
            audioText: 'दव सुकल्यानंतर कोरडा कापूस वेचा आणि सुती कपड्यात साठवा.'
          }
        ]
      }
    ]
  },

  'टोमॅटो': {
    cropName: 'टोमॅटो',
    cropIcon: '🍅',
    totalDurationDays: 110,
    stages: [
      {
        stageName: 'रोपे लागवड व आधार देणे (दिवस १ ते ३०)',
        minDays: 1,
        maxDays: 30,
        healthAdvisory: 'नागअळी (Leaf Miner) व रोपांची मर यावर सुरुवातीलाच प्रतिबंधक उपाय करा.',
        tasks: [
          {
            category: 'मशागत (Field Work)',
            title: 'तार व बांबूचा आधार देणे (Staking)',
            description: 'टोमॅटोच्या झाडांना बांबू आणि सुतळीच्या साहाय्याने आधार द्या, जेणेकरून फळे जमिनीला टेकणार नाहीत.',
            timing: 'सकाळी',
            priority: 'उच्च (High)',
            audioText: 'टोमॅटोला तार आणि बांबूचा आधार देऊन झाडे वर बांधा.'
          },
          {
            category: 'फवारणी (Spray)',
            title: 'नागअळीवर ॲबामेक्टिन फवारणी',
            description: 'पानांवर पांढऱ्या नागमोडी रेषा दिसल्यास ॲबामेक्टिन ०.५ मिली प्रति लिटर फवारा.',
            timing: 'संध्याकाळी',
            priority: 'मध्यम (Medium)',
            audioText: 'पानावरील नागअळीसाठी ॲबामेक्टिनची फवारणी करा.'
          }
        ]
      },
      {
        stageName: 'फुलोरा व फळ विकास (दिवस ३१ ते ७०)',
        minDays: 31,
        maxDays: 70,
        healthAdvisory: 'फळ पोखरणारी अळी व करपा रोगापासून पिकाचे संरक्षण करा.',
        tasks: [
          {
            category: 'खत (Fertilizer)',
            title: '१२:६१:०० व कॅल्शियम बोरोन',
            description: 'टोमॅटो तडकणे व काळा डाग (Blossom End Rot) टाळण्यासाठी कॅल्शियम व बोरॉन ड्रिपने द्या.',
            timing: 'संध्याकाळी',
            priority: 'उच्च (High)',
            audioText: 'टोमॅटो तडकू नये म्हणून कॅल्शियम आणि बोरॉन ड्रिपमधून सोडा.'
          },
          {
            category: 'फवारणी (Spray)',
            title: 'करपा रोगावर स्कोर किंवा नॅटिव्हो',
            description: 'पानांवर तपकिरी चट्टे पडल्यास डायफेनकोनाझोल (स्कोर) १ मिली प्रति लिटर फवारा.',
            timing: 'सकाळी',
            priority: 'उच्च (High)',
            audioText: 'करप्याच्या नियंत्रणासाठी स्कोर बुरशीनाशक फवारा.'
          }
        ]
      },
      {
        stageName: 'तोडणी व प्रतवारी (दिवस ७१ ते ११०)',
        minDays: 71,
        maxDays: 110,
        healthAdvisory: 'दूरच्या बाजारात पाठवण्यासाठी टोमॅटो तांबूस-पिवळे असतानाच तोडावेत.',
        tasks: [
          {
            category: 'काढणी (Harvest)',
            title: 'टोमॅटो तोडणी व क्रेट्समध्ये भरणे',
            description: 'सकाळी थंड वेळेत देठासह टोमॅटो तोडावेत. फळांना इजा न होता प्लास्टिक क्रेट्समध्ये भरा.',
            timing: 'सकाळी ८ ते ११',
            priority: 'उच्च (High)',
            audioText: 'टोमॅटोची तोडणी सकाळी थंड हवेत करून क्रेट्समध्ये भरा.'
          }
        ]
      }
    ]
  }
};

// Generic fallback cycle for crops not explicitly mapped
const GENERIC_CYCLE: CropGrowthCycle = {
  cropName: 'सामान्य पीक',
  cropIcon: '🌱',
  totalDurationDays: 100,
  stages: [
    {
      stageName: 'सुरुवातीची वाढ अवस्था (दिवस १ ते ३०)',
      minDays: 1,
      maxDays: 30,
      healthAdvisory: 'पिकाला वेळेवर तणमुक्त ठेवा व मुळांना वाफसा राहील असे पाणी द्या.',
      tasks: [
        {
          category: 'पाणी (Irrigation)',
          title: 'नियमित हलके पाणी व्यवस्थापन',
          description: 'पिकाच्या गरजेनुसार आणि जमिनीतील ओलाव्यानुसार हलके पाणी द्या.',
          timing: 'सकाळी किंवा संध्याकाळी',
          priority: 'उच्च (High)',
          audioText: 'पिकाला जमिनीतील वाफश्यानुसार हलके व नियमित पाणी द्या.'
        },
        {
          category: 'मशागत (Field Work)',
          title: 'खुरपणी व तण नियंत्रण',
          description: 'पिकाची वाढ जोमदार राहण्यासाठी तण काढून जमीन भुसभुशीत ठेवा.',
          timing: 'सकाळी',
          priority: 'मध्यम (Medium)',
          audioText: 'शेतातील तण काढून कोळपणी किंवा खुरपणी करून घ्या.'
        }
      ]
    },
    {
      stageName: 'फुलोरा व वाढीचा टप्पा (दिवस ३१ ते ७०)',
      minDays: 31,
      maxDays: 70,
      healthAdvisory: 'फुलोरा व फळधारणेच्या काळात पाण्याचा ताण पडू देऊ नका.',
      tasks: [
        {
          category: 'खत (Fertilizer)',
          title: 'संतुलित खताचा हप्ता द्यावा',
          description: '१९:१९:१९ किंवा स्थानिक शिफारसीनुसार खत देऊन पिकाचे पोषण सुधारा.',
          timing: 'पाणी देताना',
          priority: 'उच्च (High)',
          audioText: 'पिकाच्या जोमदार वाढीसाठी योग्य खताची मात्रा द्या.'
        },
        {
          category: 'फवारणी (Spray)',
          title: 'कीड व रोगांचे नियमित निरीक्षण',
          description: 'पानांवर कीड किंवा बुरशीची लक्षणे दिसताच निंबोळी अर्क किंवा बुरशीनाशक फवारा.',
          timing: 'संध्याकाळी',
          priority: 'मध्यम (Medium)',
          audioText: 'पानांची पाहणी करून रोगाची लक्षणे आढळल्यास वेळीच फवारणी करा.'
        }
      ]
    },
    {
      stageName: 'परिपक्वता व काढणी (दिवस ७१ ते १००)',
      minDays: 71,
      maxDays: 100,
      healthAdvisory: 'काढणी योग्य वेळी करून शेतमाल सावलीत सुकवून साठवावा.',
      tasks: [
        {
          category: 'काढणी (Harvest)',
          title: 'योग्य वेळी शेतमालाची काढणी',
          description: 'पीक परिपक्व झाल्यावर कोरड्या हवामानात कापणी किंवा काढणी करा.',
          timing: 'सकाळी',
          priority: 'उच्च (High)',
          audioText: 'कोरड्या हवामानात पिकाची वेळेवर काढणी पूर्ण करा.'
        }
      ]
    }
  ]
};

class CropCalendarService {
  // Get completed task IDs from local storage
  getCompletedTaskIds(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COMPLETED_TASKS);
      if (!stored) return new Set();
      const arr = JSON.parse(stored);
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  }

  // Toggle task completion status
  toggleTaskCompletion(taskId: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const set = this.getCompletedTaskIds();
      let isDone = false;
      if (set.has(taskId)) {
        set.delete(taskId);
        isDone = false;
      } else {
        set.add(taskId);
        isDone = true;
      }
      localStorage.setItem(STORAGE_KEY_COMPLETED_TASKS, JSON.stringify(Array.from(set)));
      return isDone;
    } catch {
      return false;
    }
  }

  // Get custom days planted for each crop
  getCropDaysMap(): Record<string, number> {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_CROP_DAYS);
      if (!stored) return {};
      return JSON.parse(stored) || {};
    } catch {
      return {};
    }
  }

  // Set custom days planted for a crop
  setCropDays(cropName: string, days: number): void {
    if (typeof window === 'undefined') return;
    try {
      const map = this.getCropDaysMap();
      map[cropName] = Math.max(1, days);
      localStorage.setItem(STORAGE_KEY_CUSTOM_CROP_DAYS, JSON.stringify(map));
    } catch {}
  }

  // Calculate current days planted for a given crop based on profile or custom state
  getCropPlantedDays(profile: FarmerProfile, cropName: string): number {
    const customMap = this.getCropDaysMap();
    if (customMap[cropName]) {
      return customMap[cropName];
    }
    const stage = profile.cropGrowthStages?.find((s) => s.cropName === cropName);
    if (stage?.daysPlanted) {
      return stage.daysPlanted;
    }
    // Default smart starting days per crop for realistic Solapur seasonal context
    if (cropName === 'डाळिंब') return 85; // Mid fruit growth
    if (cropName === 'कांदा') return 55; // Bulb development
    if (cropName === 'ज्वारी') return 60; // Flowering/Grain filling
    if (cropName === 'ऊस') return 120; // Cane elongation
    if (cropName === 'कापूस') return 65; // Boll formation
    if (cropName === 'टोमॅटो') return 45; // Fruit development
    return 40;
  }

  // Get current growth cycle and active stage for a crop
  getCurrentStage(cropName: string, daysPlanted: number): {
    cycle: CropGrowthCycle;
    stage: StageDefinition;
    stageIndex: number;
    totalStages: number;
    progressPercent: number;
  } {
    const cycle = CROP_CYCLES[cropName] || {
      ...GENERIC_CYCLE,
      cropName: cropName,
      cropIcon: cropName === 'तूर' ? '🌱' : cropName === 'हरभरा' ? '🫘' : cropName === 'द्राक्षे' ? '🍇' : '🌾'
    };

    let activeStage = cycle.stages[0];
    let stageIndex = 0;

    for (let i = 0; i < cycle.stages.length; i++) {
      const st = cycle.stages[i];
      if (daysPlanted >= st.minDays && daysPlanted <= st.maxDays) {
        activeStage = st;
        stageIndex = i;
        break;
      }
      if (daysPlanted > st.maxDays) {
        activeStage = st;
        stageIndex = i;
      }
    }

    const progressPercent = Math.min(
      100,
      Math.max(5, Math.round((daysPlanted / cycle.totalDurationDays) * 100))
    );

    return {
      cycle,
      stage: activeStage,
      stageIndex,
      totalStages: cycle.stages.length,
      progressPercent
    };
  }

  // Generate daily farming tasks for the farmer's primary crops
  getDailyTasksForProfile(profile: FarmerProfile): CropCalendarTask[] {
    const completedSet = this.getCompletedTaskIds();
    const primaryCrops = profile.selectedPrimaryCrops && profile.selectedPrimaryCrops.length > 0
      ? profile.selectedPrimaryCrops
      : ['डाळिंब', 'कांदा', 'ज्वारी'];

    const allTasks: CropCalendarTask[] = [];

    primaryCrops.forEach((cropName) => {
      const days = this.getCropPlantedDays(profile, cropName);
      const { cycle, stage } = this.getCurrentStage(cropName, days);

      stage.tasks.forEach((t, index) => {
        const taskId = `task-${cropName}-${stage.stageName.slice(0, 8)}-${index}`;
        allTasks.push({
          id: taskId,
          cropName: cropName,
          cropIcon: cycle.cropIcon,
          stageName: stage.stageName,
          dayNumber: days,
          taskCategory: t.category,
          taskTitle: t.title,
          taskDescription: t.description,
          timing: t.timing,
          priority: t.priority,
          audioText: `${cropName} पीक, दिवस ${days}: ${t.title}. ${t.audioText}`,
          isCompleted: completedSet.has(taskId)
        });
      });
    });

    return allTasks;
  }

  // Generate a full Marathi audio narration of all today's tasks
  getAudioSummary(tasks: CropCalendarTask[]): string {
    if (tasks.length === 0) {
      return 'आज आपल्या कोणत्याही पिकासाठी तातडीचे काम शिल्लक नाही.';
    }
    const pendingTasks = tasks.filter((t) => !t.isCompleted);
    if (pendingTasks.length === 0) {
      return 'अभिनंदन! आजची सर्व शेती कामे आपण यशस्वीपणे पूर्ण केली आहेत.';
    }

    const titles = pendingTasks.slice(0, 3).map((t) => `${t.cropName}साठी ${t.taskTitle}`).join('. तसेच ');
    return `आज आपल्या पिकांसाठी ${pendingTasks.length} कामे सुचवली आहेत. मुख्य कामे: ${titles}. वेळेत पूर्ण करा.`;
  }
}

export const cropCalendarService = new CropCalendarService();
