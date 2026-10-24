// Comprehensive database of official manufacturer customer care, WhatsApp support, and service claim portals

export const BRAND_SUPPORT_DIRECTORY = [
  {
    id: 'samsung',
    name: 'Samsung',
    aliases: ['samsung', 'galaxy'],
    tollFree: '1800-40-7267864',
    tollFreeDisplay: '1800 40 SAMSUNG (1800 40 7267864)',
    whatsapp: '91180057267864',
    website: 'https://www.samsung.com/in/support/service-centre/',
    operatingHours: '24/7 Toll-Free Support',
    category: 'Electronics & Appliances',
    claimNotes: 'Keep your Model Code and IMEI / Serial Number ready from the device back label.',
  },
  {
    id: 'lg',
    name: 'LG Electronics',
    aliases: ['lg', 'lg electronics', 'life\'s good'],
    tollFree: '1800-315-9999',
    tollFreeDisplay: '1800-315-9999 / 1800-180-9999',
    whatsapp: '919711709999',
    website: 'https://www.lg.com/in/support/service-repair/request-repair',
    operatingHours: '8:00 AM – 8:00 PM (All 7 Days)',
    category: 'Home & Kitchen Appliances',
    claimNotes: 'Official door-step technician booking available via website or WhatsApp.',
  },
  {
    id: 'sony',
    name: 'Sony',
    aliases: ['sony', 'bravia', 'playstation'],
    tollFree: '1800-103-7799',
    tollFreeDisplay: '1800-103-7799',
    whatsapp: '918591970108',
    website: 'https://www.sony.co.in/electronics/support/service-centres',
    operatingHours: '9:00 AM – 7:30 PM (Mon–Sun)',
    category: 'TV, Audio & Cameras',
    claimNotes: 'Original invoice and serial number required for warranty verification.',
  },
  {
    id: 'apple',
    name: 'Apple',
    aliases: ['apple', 'iphone', 'macbook', 'ipad'],
    tollFree: '000800-1009009',
    tollFreeDisplay: '000800 100 9009 (Toll-Free)',
    whatsapp: null,
    website: 'https://support.apple.com/repair',
    operatingHours: '9:00 AM – 9:00 PM (Daily)',
    category: 'Electronics & Computing',
    claimNotes: 'Reserve a Genius Bar appointment or visit Apple Authorized Service Providers (AASP).',
  },
  {
    id: 'dell',
    name: 'Dell Technologies',
    aliases: ['dell', 'alienware', 'inspiron', 'xps'],
    tollFree: '1800-425-0088',
    tollFreeDisplay: '1800-425-0088 / 1800-425-2067',
    whatsapp: '917997970088',
    website: 'https://www.dell.com/support/home/',
    operatingHours: '24/7 Technical Support',
    category: 'Laptops & Computers',
    claimNotes: 'Have your 7-character Dell Service Tag (located on bottom cover) ready.',
  },
  {
    id: 'hp',
    name: 'HP (Hewlett-Packard)',
    aliases: ['hp', 'hewlett-packard', 'pavilion', 'omen'],
    tollFree: '1800-258-7170',
    tollFreeDisplay: '1800-258-7170',
    whatsapp: '912261014560',
    website: 'https://support.hp.com/in-en/service-center',
    operatingHours: '9:00 AM – 7:00 PM (Mon–Sat)',
    category: 'Computers & Printers',
    claimNotes: 'HP Onsite warranty supports home pickup and doorstep service.',
  },
  {
    id: 'lenovo',
    name: 'Lenovo',
    aliases: ['lenovo', 'thinkpad', 'ideapad', 'legion'],
    tollFree: '1800-419-7555',
    tollFreeDisplay: '1800-419-7555',
    whatsapp: '918067916666',
    website: 'https://support.lenovo.com/service-provider',
    operatingHours: '9:00 AM – 6:00 PM (Mon–Sat)',
    category: 'Computers & Tablets',
    claimNotes: 'Provide Serial Number (S/N) for fast warranty entitlement lookup.',
  },
  {
    id: 'whirlpool',
    name: 'Whirlpool',
    aliases: ['whirlpool'],
    tollFree: '1800-208-1800',
    tollFreeDisplay: '1800-208-1800',
    whatsapp: '919667427788',
    website: 'https://www.whirlpoolindia.com/customer-care',
    operatingHours: '8:00 AM – 8:00 PM (Daily)',
    category: 'Home Appliances',
    claimNotes: 'Quick service request can be logged directly using registered mobile number.',
  },
  {
    id: 'philips',
    name: 'Philips',
    aliases: ['philips'],
    tollFree: '1800-102-2929',
    tollFreeDisplay: '1800-102-2929',
    whatsapp: '919311827291',
    website: 'https://www.philips.co.in/c-w/support-home/service-and-repair.html',
    operatingHours: '9:00 AM – 9:00 PM (Mon–Sun)',
    category: 'Kitchen & Personal Care',
    claimNotes: 'Small domestic appliances can be carried into nearest authorized service centers.',
  },
  {
    id: 'bosch',
    name: 'Bosch Home Appliances',
    aliases: ['bosch', 'siemens'],
    tollFree: '1800-266-1880',
    tollFreeDisplay: '1800-266-1880',
    whatsapp: '918451000555',
    website: 'https://www.bosch-home.in/service/book-a-repair',
    operatingHours: '24/7 Helpline Support',
    category: 'Home & Kitchen Appliances',
    claimNotes: 'Certified Bosch engineers visit doorstep for dishwashers, washing machines & ovens.',
  },
  {
    id: 'haier',
    name: 'Haier',
    aliases: ['haier'],
    tollFree: '1800-200-9999',
    tollFreeDisplay: '1800-200-9999 / 1800-102-9999',
    whatsapp: '918553049999',
    website: 'https://www.haier.com/in/service-support/',
    operatingHours: '24/7 Helpline Support',
    category: 'Home Appliances',
    claimNotes: 'Doorstep service appointment available nationwide.',
  },
  {
    id: 'voltas',
    name: 'Voltas (A Tata Enterprise)',
    aliases: ['voltas', 'voltas beko', 'beko'],
    tollFree: '1860-599-4555',
    tollFreeDisplay: '1860-599-4555 / 9650694555',
    whatsapp: '919650694555',
    website: 'https://www.voltas.com/pages/service-locator',
    operatingHours: '8:00 AM – 8:00 PM (Daily)',
    category: 'Air Conditioning & Refrigeration',
    claimNotes: 'Quote warranty registration number or tax invoice during service booking.',
  },
  {
    id: 'daikin',
    name: 'Daikin Air Conditioning',
    aliases: ['daikin'],
    tollFree: '1860-180-3900',
    tollFreeDisplay: '1860-180-3900 / 011-40319300',
    whatsapp: '919210188999',
    website: 'https://www.daikinindia.com/service-request',
    operatingHours: '9:00 AM – 6:00 PM (Mon–Sat)',
    category: 'HVAC & Air Conditioners',
    claimNotes: 'Annual maintenance and preventive filter cleaning appointments available.',
  },
  {
    id: 'godrej',
    name: 'Godrej Appliances',
    aliases: ['godrej', 'godrej appliances'],
    tollFree: '1800-209-5511',
    tollFreeDisplay: '1800-209-5511',
    whatsapp: '919321665511',
    website: 'https://www.godrej.com/appliances/smartcare',
    operatingHours: '24/7 SmartCare Support',
    category: 'Home Appliances',
    claimNotes: 'Godrej SmartCare provides genuine spare parts and doorstep warranty resolution.',
  },
  {
    id: 'ifb',
    name: 'IFB Appliances',
    aliases: ['ifb'],
    tollFree: '1860-208-5678',
    tollFreeDisplay: '1860-208-5678 / 1860-425-5678',
    whatsapp: '919230555678',
    website: 'https://www.ifbappliances.com/service',
    operatingHours: '8:00 AM – 8:00 PM (Daily)',
    category: 'Home & Kitchen Appliances',
    claimNotes: 'Doorstep technicians provide warranty repairs and water descaling checks.',
  },
  {
    id: 'xiaomi',
    name: 'Xiaomi / Mi',
    aliases: ['xiaomi', 'mi', 'redmi'],
    tollFree: '1800-103-6286',
    tollFreeDisplay: '1800-103-6286',
    whatsapp: '918861826286',
    website: 'https://www.mi.com/in/service/repair/',
    operatingHours: '9:00 AM – 9:00 PM (Daily)',
    category: 'Smartphones & Smart TV',
    claimNotes: 'Book appointment via Mi Service portal for priority walk-in or home pickup.',
  },
  {
    id: 'asus',
    name: 'Asus',
    aliases: ['asus', 'rog', 'zenbook', 'vivobook'],
    tollFree: '1800-209-0365',
    tollFreeDisplay: '1800-209-0365',
    whatsapp: '919015933666',
    website: 'https://www.asus.com/in/support/service-center/india',
    operatingHours: '9:00 AM – 6:00 PM (Mon–Sat)',
    category: 'Laptops & Hardware',
    claimNotes: 'Onsite pickup service supported for registered laptops with active warranty.',
  },
  {
    id: 'panasonic',
    name: 'Panasonic',
    aliases: ['panasonic'],
    tollFree: '1800-103-1333',
    tollFreeDisplay: '1800-103-1333 / 1800-108-1333',
    whatsapp: '919311211333',
    website: 'https://www.panasonic.com/in/support.html',
    operatingHours: '9:00 AM – 6:00 PM (Daily)',
    category: 'Appliances & Consumer Tech',
    claimNotes: 'Service tracking and engineer dispatch notification sent via SMS.',
  },
  {
    id: 'havells',
    name: 'Havells / Lloyd',
    aliases: ['havells', 'lloyd'],
    tollFree: '08045771313',
    tollFreeDisplay: '08045 771313 / 1800-103-1313',
    whatsapp: '919711773333',
    website: 'https://www.havells.com/en/consumer/support.html',
    operatingHours: '24/7 Havells Connect Helpline',
    category: 'Electricals & Appliances',
    claimNotes: 'Doorstep warranty inspection available across major cities.',
  },
  {
    id: 'bajaj',
    name: 'Bajaj Electricals',
    aliases: ['bajaj', 'bajaj electricals'],
    tollFree: '022-41280000',
    tollFreeDisplay: '022-4128 0000 / 1800-102-5963',
    whatsapp: '917039920000',
    website: 'https://www.bajajelectricals.com/support/',
    operatingHours: '9:00 AM – 6:00 PM (Mon–Sat)',
    category: 'Kitchen & Small Appliances',
    claimNotes: 'Contact nearest authorized service center with copy of purchase bill.',
  },
  {
    id: 'kent',
    name: 'Kent RO Systems',
    aliases: ['kent', 'kent ro'],
    tollFree: '9278-10-1010',
    tollFreeDisplay: '9278-10-1010',
    whatsapp: '919212101010',
    website: 'https://www.kent.co.in/service/request',
    operatingHours: '8:00 AM – 8:00 PM (Daily)',
    category: 'Water Purifiers & Kitchen',
    claimNotes: 'Periodic RO filter change & free warranty service visit booking.',
  },
];

/**
 * Find brand support details with intelligent matching and generic fallback
 * @param {string} rawBrand - Brand name entered by user
 * @param {object} product - Optional product info (name, modelNumber, serialNumber)
 */
export function getBrandSupport(rawBrand, product = {}) {
  if (!rawBrand || typeof rawBrand !== 'string') {
    return createGenericFallback('Manufacturer', product);
  }

  const cleaned = rawBrand.trim().toLowerCase();

  // Search in directory
  const matched = BRAND_SUPPORT_DIRECTORY.find((item) => {
    return (
      item.name.toLowerCase() === cleaned ||
      item.aliases.some((alias) => cleaned.includes(alias) || alias.includes(cleaned))
    );
  });

  if (matched) {
    const customMessage = buildWhatsAppMessage(matched.name, product);
    return {
      ...matched,
      isVerified: true,
      whatsAppUrl: matched.whatsapp
        ? `https://wa.me/${matched.whatsapp}?text=${encodeURIComponent(customMessage)}`
        : null,
      callUrl: `tel:${matched.tollFree.replace(/[^0-9+]/g, '')}`,
    };
  }

  // Not in directory -> Generate smart dynamic fallback
  return createGenericFallback(rawBrand.trim(), product);
}

/**
 * Builds prefilled WhatsApp message for claiming support
 */
function buildWhatsAppMessage(brandName, product) {
  let msg = `Hello ${brandName} Support, I need assistance/service under warranty.`;
  if (product.productName) msg += `\nProduct: ${product.productName}`;
  if (product.modelNumber) msg += `\nModel: ${product.modelNumber}`;
  if (product.serialNumber) msg += `\nSerial No: ${product.serialNumber}`;
  msg += `\nPlease let me know the nearest authorized service center or technician booking procedure.`;
  return msg;
}

/**
 * Creates dynamic fallback for any non-cataloged brand
 */
function createGenericFallback(brandName, product) {
  const searchQuery = `${brandName} customer care toll free helpline authorized service center`;
  const mapsQuery = `${brandName} authorized service center near me`;

  return {
    id: 'generic',
    name: brandName,
    isVerified: false,
    tollFree: null,
    tollFreeDisplay: 'Search Helpline Online',
    whatsapp: null,
    whatsAppUrl: null,
    website: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
    mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(mapsQuery)}`,
    operatingHours: 'Check Brand Official Website',
    category: 'Appliance / Electronic Device',
    claimNotes: `Keep your purchase invoice, warranty card, and device serial number ready before contacting ${brandName} support.`,
    callUrl: null,
  };
}
