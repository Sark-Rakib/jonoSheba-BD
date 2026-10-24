export interface District {
  name: string;
  nameEn: string;
  /** Partial coverage — only districts with curated upazila data include this. */
  upazilas?: string[];
}

export interface Division {
  name: string;
  nameEn: string;
  districts: District[];
}

/**
 * Bangladesh administrative divisions and districts (complete, 8 / 64).
 * Upazila coverage is partial and intentionally limited to districts where
 * the data has been curated; extend `upazilas` to add more.
 */
export const DIVISIONS: Division[] = [
  {
    name: "ঢাকা",
    nameEn: "Dhaka",
    districts: [
      {
        name: "ঢাকা",
        nameEn: "Dhaka",
        upazilas: ["সাভার", "কেরানীগঞ্জ", "ধামরাই", "দোহার", "নবাবগঞ্জ"],
      },
      { name: "গাজীপুর", nameEn: "Gazipur", upazilas: ["কালিয়াকৈর", "কালীগঞ্জ", "কাপাসিয়া", "শ্রীপুর"] },
      { name: "নারায়ণগঞ্জ", nameEn: "Narayanganj", upazilas: ["আড়াইহাজার", "বন্দর", "রূপগঞ্জ", "সোনারগাঁও"] },
      { name: "ফরিদপুর", nameEn: "Faridpur" },
      { name: "গোপালগঞ্জ", nameEn: "Gopalganj" },
      { name: "কিশোরগঞ্জ", nameEn: "Kishoreganj" },
      { name: "মাদারীপুর", nameEn: "Madaripur" },
      { name: "মানিকগঞ্জ", nameEn: "Manikganj" },
      { name: "মুন্সিগঞ্জ", nameEn: "Munshiganj" },
      { name: "নরসিংদী", nameEn: "Narsingdi" },
      { name: "শরীয়তপুর", nameEn: "Shariatpur" },
      { name: "টাঙ্গাইল", nameEn: "Tangail" },
    ],
  },
  {
    name: "চট্টগ্রাম",
    nameEn: "Chattogram",
    districts: [
      {
        name: "চট্টগ্রাম",
        nameEn: "Chattogram",
        upazilas: [
          "আনোয়ারা",
          "বাঁশখালী",
          "বোয়ালখালী",
          "চন্দনাইশ",
          "ফটিকছড়ি",
          "হাটহাজারী",
          "লোহাগাড়া",
          "মীরসরাই",
          "পটিয়া",
          "রাঙ্গুনিয়া",
          "রাউজান",
          "সন্দ্বীপ",
          "সাতকানিয়া",
          "সীতাকুণ্ড",
        ],
      },
      {
        name: "কক্সবাজার",
        nameEn: "Cox's Bazar",
        upazilas: ["চকরিয়া", "কুতুবদিয়া", "মহেশখালী", "পেকুয়া", "রামু", "টেকনাফ", "উখিয়া", "কক্সবাজার সদর"],
      },
      { name: "কুমিল্লা", nameEn: "Cumilla" },
      { name: "বান্দরবান", nameEn: "Bandarban" },
      { name: "চাঁদপুর", nameEn: "Chandpur" },
      { name: "ফেনী", nameEn: "Feni" },
      { name: "লক্ষ্মীপুর", nameEn: "Lakshmipur" },
      { name: "নোয়াখালী", nameEn: "Noakhali" },
      { name: "রাঙামাটি", nameEn: "Rangamati" },
      { name: "খাগড়াছড়ি", nameEn: "Khagrachhari" },
    ],
  },
  {
    name: "রাজশাহী",
    nameEn: "Rajshahi",
    districts: [
      { name: "রাজশাহী", nameEn: "Rajshahi" },
      { name: "বগুড়া", nameEn: "Bogura" },
      { name: "জয়পুরহাট", nameEn: "Joypurhat" },
      { name: "নওগাঁ", nameEn: "Naogaon" },
      { name: "নাটোর", nameEn: "Natore" },
      { name: "চাঁপাইনবাবগঞ্জ", nameEn: "Chapainawabganj" },
      { name: "পাবনা", nameEn: "Pabna" },
      { name: "সিরাজগঞ্জ", nameEn: "Sirajganj" },
    ],
  },
  {
    name: "খুলনা",
    nameEn: "Khulna",
    districts: [
      { name: "খুলনা", nameEn: "Khulna" },
      { name: "বাগেরহাট", nameEn: "Bagerhat" },
      { name: "চুয়াডাঙ্গা", nameEn: "Chuadanga" },
      { name: "যশোর", nameEn: "Jashore" },
      { name: "ঝিনাইদহ", nameEn: "Jhenaidah" },
      { name: "কুষ্টিয়া", nameEn: "Kushtia" },
      { name: "মাগুরা", nameEn: "Magura" },
      { name: "মেহেরপুর", nameEn: "Meherpur" },
      { name: "নড়াইল", nameEn: "Narail" },
      { name: "সাতক্ষীরা", nameEn: "Satkhira" },
    ],
  },
  {
    name: "বরিশাল",
    nameEn: "Barishal",
    districts: [
      { name: "বরিশাল", nameEn: "Barishal" },
      { name: "পটুয়াখালী", nameEn: "Patuakhali" },
      { name: "ভোলা", nameEn: "Bhola" },
      { name: "পিরোজপুর", nameEn: "Pirojpur" },
      { name: "বরগুনা", nameEn: "Barguna" },
    ],
  },
  {
    name: "সিলেট",
    nameEn: "Sylhet",
    districts: [
      {
        name: "সিলেট",
        nameEn: "Sylhet",
        upazilas: [
          "বালাগঞ্জ",
          "বিয়ানীবাজার",
          "বিশ্বনাথ",
          "কোম্পানীগঞ্জ",
          "ফেঞ্চুগঞ্জ",
          "গোলাপগঞ্জ",
          "গোয়াইনঘাট",
          "জৈন্তাপুর",
          "কানাইঘাট",
          "জকিগঞ্জ",
          "ওসমানীনগর",
        ],
      },
      { name: "হবিগঞ্জ", nameEn: "Habiganj" },
      { name: "মৌলভীবাজার", nameEn: "Moulvibazar" },
      { name: "সুনামগঞ্জ", nameEn: "Sunamganj" },
    ],
  },
  {
    name: "রংপুর",
    nameEn: "Rangpur",
    districts: [
      { name: "রংপুর", nameEn: "Rangpur" },
      { name: "দিনাজপুর", nameEn: "Dinajpur" },
      { name: "গাইবান্ধা", nameEn: "Gaibandha" },
      { name: "কুড়িগ্রাম", nameEn: "Kurigram" },
      { name: "লালমনিরহাট", nameEn: "Lalmonirhat" },
      { name: "নীলফামারী", nameEn: "Nilphamari" },
      { name: "পঞ্চগড়", nameEn: "Panchagarh" },
      { name: "ঠাকুরগাঁও", nameEn: "Thakurgaon" },
    ],
  },
  {
    name: "ময়মনসিংহ",
    nameEn: "Mymensingh",
    districts: [
      { name: "ময়মনসিংহ", nameEn: "Mymensingh" },
      { name: "জামালপুর", nameEn: "Jamalpur" },
      { name: "নেত্রকোণা", nameEn: "Netrokona" },
      { name: "শেরপুর", nameEn: "Sherpur" },
    ],
  },
];

export const DIVISION_NAMES = DIVISIONS.map((d) => d.name);

export function getDistricts(divisionName: string): District[] {
  return DIVISIONS.find((d) => d.name === divisionName)?.districts ?? [];
}

export function getUpazilas(
  divisionName: string,
  districtName: string,
): string[] {
  return (
    getDistricts(divisionName).find((d) => d.name === districtName)?.upazilas ??
    []
  );
}

export function isValidLocation(selection: {
  division: string;
  district: string;
}): boolean {
  const division = DIVISIONS.find((d) => d.name === selection.division);
  if (!division) return false;
  return division.districts.some((d) => d.name === selection.district);
}
