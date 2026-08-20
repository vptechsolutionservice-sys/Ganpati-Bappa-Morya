import type { Template } from '../types';

export const TEMPLATES: Template[] = [
  {
    id: 'traditional',
    name: 'Traditional Maharashtrian',
    name_marathi: 'पारंपरिक महाराष्ट्रीयन',
    category: 'traditional',
    status: 'active',
    created_at: new Date().toISOString(),
    configuration: {
      primaryColor: '#ff7300',
      secondaryColor: '#d4a017',
      accentColor: '#c0392b',
      background: 'bg-gradient-to-b from-amber-50 to-orange-50',
      fontStyle: 'devanagari',
      borderStyle: 'ornate',
      showMandala: true,
      showToran: true,
      showDiyas: true,
      showFlowers: true,
      showParticles: true,
    },
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    name_marathi: 'रॉयल गोल्ड',
    category: 'royal',
    status: 'active',
    created_at: new Date().toISOString(),
    configuration: {
      primaryColor: '#d4a017',
      secondaryColor: '#b8860b',
      accentColor: '#8b0000',
      background: 'bg-gradient-to-b from-yellow-50 to-amber-100',
      fontStyle: 'serif',
      borderStyle: 'royal',
      showMandala: true,
      showToran: false,
      showDiyas: true,
      showFlowers: false,
      showParticles: true,
    },
  },
  {
    id: 'red-gold',
    name: 'Red & Gold',
    name_marathi: 'लाल आणि सोनेरी',
    category: 'traditional',
    status: 'active',
    created_at: new Date().toISOString(),
    configuration: {
      primaryColor: '#c0392b',
      secondaryColor: '#d4a017',
      accentColor: '#ff7300',
      background: 'bg-gradient-to-b from-red-50 to-orange-50',
      fontStyle: 'devanagari',
      borderStyle: 'double',
      showMandala: false,
      showToran: true,
      showDiyas: true,
      showFlowers: true,
      showParticles: false,
    },
  },
  {
    id: 'minimal',
    name: 'Minimal Bappa',
    name_marathi: 'सुटसुटीत',
    category: 'minimal',
    status: 'active',
    created_at: new Date().toISOString(),
    configuration: {
      primaryColor: '#3d1f00',
      secondaryColor: '#d4a017',
      accentColor: '#ff7300',
      background: 'bg-white',
      fontStyle: 'modern',
      borderStyle: 'thin',
      showMandala: false,
      showToran: false,
      showDiyas: false,
      showFlowers: false,
      showParticles: false,
    },
  },
  {
    id: 'floral',
    name: 'Floral Ganpati',
    name_marathi: 'फुलांचे गणपती',
    category: 'floral',
    status: 'active',
    created_at: new Date().toISOString(),
    configuration: {
      primaryColor: '#e91e63',
      secondaryColor: '#ff9800',
      accentColor: '#4caf50',
      background: 'bg-gradient-to-b from-pink-50 to-rose-50',
      fontStyle: 'devanagari',
      borderStyle: 'floral',
      showMandala: false,
      showToran: true,
      showDiyas: false,
      showFlowers: true,
      showParticles: true,
    },
  },
  {
    id: 'temple',
    name: 'Temple Theme',
    name_marathi: 'मंदिर थीम',
    category: 'temple',
    status: 'active',
    created_at: new Date().toISOString(),
    configuration: {
      primaryColor: '#8b4513',
      secondaryColor: '#d4a017',
      accentColor: '#ff8c00',
      background: 'bg-gradient-to-b from-stone-50 to-amber-50',
      fontStyle: 'serif',
      borderStyle: 'temple',
      showMandala: true,
      showToran: false,
      showDiyas: true,
      showFlowers: false,
      showParticles: false,
    },
  },
  {
    id: 'peshwai',
    name: 'Peshwai Theme',
    name_marathi: 'पेशवाई थीम',
    category: 'peshwai',
    status: 'active',
    created_at: new Date().toISOString(),
    configuration: {
      primaryColor: '#8b0000',
      secondaryColor: '#d4a017',
      accentColor: '#4a148c',
      background: 'bg-gradient-to-b from-red-950 to-red-900',
      fontStyle: 'marathi-serif',
      borderStyle: 'peshwai',
      showMandala: true,
      showToran: false,
      showDiyas: true,
      showFlowers: false,
      showParticles: true,
    },
  },
  {
    id: 'modern-luxury',
    name: 'Modern Luxury',
    name_marathi: 'आधुनिक लक्झरी',
    category: 'modern',
    status: 'active',
    created_at: new Date().toISOString(),
    configuration: {
      primaryColor: '#1a1a2e',
      secondaryColor: '#d4a017',
      accentColor: '#ff7300',
      background: 'bg-gradient-to-b from-slate-900 to-slate-800',
      fontStyle: 'inter',
      borderStyle: 'modern',
      showMandala: false,
      showToran: false,
      showDiyas: true,
      showFlowers: false,
      showParticles: true,
    },
  },
  {
    id: 'eco-friendly',
    name: 'Eco-Friendly Ganpati',
    name_marathi: 'पर्यावरणपूरक गणपती',
    category: 'eco',
    status: 'active',
    created_at: new Date().toISOString(),
    configuration: {
      primaryColor: '#2e7d32',
      secondaryColor: '#689f38',
      accentColor: '#ff8f00',
      background: 'bg-gradient-to-b from-green-50 to-emerald-50',
      fontStyle: 'devanagari',
      borderStyle: 'leaf',
      showMandala: false,
      showToran: false,
      showDiyas: false,
      showFlowers: true,
      showParticles: false,
    },
  },
  {
    id: 'family-celebration',
    name: 'Family Celebration',
    name_marathi: 'कौटुंबिक उत्सव',
    category: 'family',
    status: 'active',
    created_at: new Date().toISOString(),
    configuration: {
      primaryColor: '#ff7300',
      secondaryColor: '#d4a017',
      accentColor: '#c0392b',
      background: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50',
      fontStyle: 'devanagari',
      borderStyle: 'family',
      showMandala: true,
      showToran: true,
      showDiyas: true,
      showFlowers: true,
      showParticles: true,
    },
  },
];

export const TEMPLATE_EMOJIS: Record<string, string> = {
  'traditional': '🪔',
  'royal-gold': '👑',
  'red-gold': '❤️',
  'minimal': '✨',
  'floral': '🌸',
  'temple': '🛕',
  'peshwai': '⚔️',
  'modern-luxury': '💎',
  'eco-friendly': '🌿',
  'family-celebration': '👨‍👩‍👧‍👦',
};

export const PREDEFINED_MESSAGES = {
  traditional: `श्री गणेशाय नमः 🙏

गणपती बाप्पांच्या आगमनाने आमच्या घरी आनंदाचे आणि भक्तीचे वातावरण निर्माण झाले आहे.

या मंगलमय प्रसंगी आपण सहकुटुंब उपस्थित राहून बाप्पांचे दर्शन घ्यावे व आमचा आनंद द्विगुणित करावा, ही नम्र विनंती.

गणपती बाप्पा मोरया! 🙏`,

  emotional: `🙏 श्री गणेशाय नमः

बाप्पांचे आगमन म्हणजे आमच्यासाठी एक अत्यंत आनंदाचा क्षण आहे.

दरवर्षी बाप्पा आमच्या घरी येतात आणि आमचे जीवन आशीर्वादांनी भरून जाते.

यावर्षी आपण आमच्यासोबत हा आनंद साजरा करावा, ही मनापासून विनंती आहे.

बाप्पा आपल्यावर आपल्या कुटुंबावर सदैव कृपा ठेवोत! ❤️

गणपती बाप्पा मोरया! मंगलमूर्ती मोरया!`,

  short: `🙏 बाप्पांचे आगमन झाले आहे!

आपण सपरिवार दर्शनाला यावे.

गणपती बाप्पा मोरया! 🪔`,

  family: `🙏 श्री गणेशाय नमः

आमच्या कुटुंबाकडे गणपती बाप्पांचे आगमन झाले आहे.

आपण सहकुटुंब येऊन बाप्पांचे दर्शन घ्यावे आणि महाप्रसाद ग्रहण करावा.

आपली उपस्थिती आमच्यासाठी अत्यंत महत्त्वाची आहे. ❤️

गणपती बाप्पा मोरया!`,

  friends: `Hey! 🙏

Bappa आले आहेत! 🎉

यावेळी घरी ये. महाप्रसाद आहे, aarti आहे आणि खूप मजा होईल!

गणपती बाप्पा मोरया! 🌸`,

  neighbors: `🙏 प्रिय शेजारी मित्रांनो,

आमच्या घरी गणपती बाप्पांचे आगमन झाले आहे.

आपण येऊन बाप्पांचे दर्शन घ्यावे आणि प्रसाद ग्रहण करावा.

तुमची उपस्थिती आमच्यासाठी आनंदाची असेल. 🙏

गणपती बाप्पा मोरया!`,

  formal: `🙏 श्री गणेशाय नमः

सादर निमंत्रण

आपणास सविनय कळविण्यात येते की आमच्या निवासस्थानी गणपती बाप्पांची प्रतिष्ठापना करण्यात येत आहे.

या पवित्र सोहळ्यात आपण सपरिवार उपस्थित राहण्याची कृपा करावी.

आपला,
[Host Name] व परिवार

गणपती बाप्पा मोरया! 🙏`,
};
