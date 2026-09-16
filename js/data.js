const BELLS = [
    { n: 1, from: "9:00",  to: "9:45"  },
    { n: 2, from: "9:50",  to: "10:35" },
    { n: 3, from: "10:40", to: "11:25" },
    { n: 4, from: "11:40", to: "12:25" },
    { n: 5, from: "13:05", to: "13:50" },
    { n: 6, from: "13:55", to: "14:40" },
    { n: 7, from: "14:45", to: "15:30" },
];

// Hranice pre farby priemeru v % (zelená od "good", oranžová od "warn", inak červená)
const PERCENT_SCALE = { good: 75, warn: 50 };

// Školský rok – dátumy (RRRR-MM-DD). Upravte každý rok.
const SCHOOL_YEAR = {
  start:   "2026-09-02",   // prvý vyučovací deň
  sem1End: "2027-01-31",   // koniec 1. polroka
  sem2End: "2027-06-30",   // koniec 2. polroka
};
// Dni voľna počas vyučovania – nepočítajú sa ako odučené (od, do). Prázdniny doplňte podľa Edupage.
const HOLIDAYS = [
  ["2026-09-15", "2026-09-15"],  // Sedembolestná Panna Mária
  ["2026-10-29", "2026-10-30"],  // jesenné prázdniny
  ["2026-11-01", "2026-11-01"],  // Sviatok všetkých svätých
  ["2026-11-17", "2026-11-17"],  // Deň boja za slobodu a demokraciu
  ["2026-12-23", "2027-01-07"],  // vianočné prázdniny
  ["2027-02-01", "2027-02-01"],  // polročné prázdniny
  ["2027-03-01", "2027-03-05"],  // jarné prázdniny – Bratislavský kraj
  ["2027-03-25", "2027-03-30"],  // veľkonočné prázdniny
  ["2027-05-01", "2027-05-01"],  // Sviatok práce
  ["2027-05-08", "2027-05-08"],  // Deň víťazstva nad fašizmom
];

const GUIDE = [
  { t: "Absencie a ospravedlnenie", src: "čl. XII", items: [
    "1. deň absencie: rodič (alebo plnoletý žiak) oznámi dôvod – telefón, Edupage, Slack alebo e-mail.",
    "Po návrate: do 3 dní doložiť doklad (Edupage / Slack / e-mail), inak môže byť absencia neospravedlnená.",
    "Lekárske potvrdenie treba pri chorobe 5 a viac dní za sebou, alebo viac ako 10 dní za mesiac.",
    "Nad 30 % vymeškaných hodín z predmetu za polrok → možné komisionálne preskúšanie.",
    "Viac ako 5 dní neospravedlnene za sebou → písomná výzva riaditeľa; ak do 10 dní nič, berie sa to ako zanechanie štúdia.",
  ]},
  { t: "Neskoré príchody", src: "čl. XVII", items: [
    "Meškanie do 15 min = neskorý príchod, zapíše sa do triednej knihy.",
    "Meškanie nad 15 min = absencia na hodine.",
    "Neskoré príchody sa sčítavajú po minútach; viac ako 3 sa spravidla rátajú ako 1 neospravedlnená hodina.",
    "Dochádzku si skontroluj aspoň 1× týždenne, najneskôr v piatok – vtedy sa uzatvára.",
  ]},
  { t: "Uvoľnenie z vyučovania (vopred známy dôvod)", src: "čl. XI", items: [
    "Posledná hodina → vyučujúci alebo triedny.",
    "1 hodina alebo 1 deň → triedny učiteľ.",
    "Menej ako 5 dní za sebou → riaditeľ, písomná žiadosť.",
    "Viac ako 5 dní → riaditeľ po prerokovaní s pedagogickou radou.",
    "Neplnoletý žiak nemôže pri nevoľnosti odísť sám – rozhoduje škola po dohode s rodičom.",
  ]},
  { t: "Dištančná účasť (online z domu)", src: "čl. XIII", items: [
    "Žiadosť sa podáva cez Slack, aspoň 1 deň vopred (výnimočne v deň, ale pred začiatkom vyučovania).",
    "Dôvody: krátkodobá choroba, rekonvalescencia, karanténa, mimoriadne udalosti a pod.",
    "Musíš byť pripojený načas, celú hodinu a reagovať – inak vyučujúci zapíše neospravedlnenú hodinu.",
    "Potrebuješ spoľahlivý internet, funkčné zariadenie a prístup k aplikáciám.",
  ]},
  { t: "Mobil a vlastné zariadenia", src: "čl. X", items: [
    "Počas vyučovania aj cez prestávky je mobil zakázaný (aj smart hodinky, tablety, konzoly…).",
    "Mobil má byť v skrinke; ak ju nemáš, v stojane v triede počas celej hodiny.",
    "Výnimka len na vyučovacie účely so súhlasom vyučujúceho alebo triedneho.",
    "Fotiť/nahrávať spolužiakov či mentorov bez súhlasu je zakázané.",
    "Pri porušení môže vyučujúci mobil odobrať – dostaneš ho po skončení vyučovania.",
  ]},
  { t: "Školský notebook, tablet a AI", src: "Etický kódex, čl. VI", items: [
    "Školská technika je predovšetkým na vzdelávanie. Nemeníš systémové nastavenia, neinštaluješ nepovolený softvér, nezasahuješ do siete.",
    "Tablet na hodine len ako pracovná pomôcka (poznámky, materiály, zadania) – nie hry, sociálne siete, chat.",
    "AI je nástroj – či ju pri zadaní môžeš použiť, určuje mentor. Použitie AI priznáš/označíš, ak to mentor vyžaduje.",
    "AI nesmieš používať pri overovaní vedomostí, kde je zakázaná, ani na ponižujúce či diskriminačné materiály.",
  ]},
  { t: "Hodnotenie a vysvedčenie", src: "čl. XVIII", items: [
    "Známky 1–5. Výsledok písomky ti vyučujúci oznámi do 14 dní.",
    "Máš právo vedieť, čo sa bude hodnotiť, poznať výsledok každého hodnotenia a nechať si vysvetliť klasifikáciu.",
    "Vyznamenanie: nič horšie ako 2, priemer ≤ 1,5. Veľmi dobre: nič horšie ako 3, priemer ≤ 2,0.",
    "Najviac 2 päťky na konci roka → opravné skúšky so súhlasom riaditeľa.",
  ]},
  { t: "Ako sa riešia problémy – 4 úrovne", src: "Etický kódex, čl. XI", items: [
    "Úroveň 1: menšie vyrušovanie (rozprávanie, mobil, meškanie, neplnenie práce) – mentor upozorní, dá šancu napraviť. 3× za týždeň bez nápravy → úroveň 2.",
    "Úroveň 2: opakované nerešpektovanie pravidiel, vulgárnosť, odchod z hodiny – individuálny rozhovor, záznam, informovanie rodiča.",
    "Úroveň 3–4: závažné veci (šikana, agresia, alkohol/drogy, falšovanie potvrdení) – rieši vedenie školy, možné pokarhanie až vylúčenie.",
    "Cieľom nie je „zbierať tresty“, ale zastaviť nevhodné správanie a dať priestor na nápravu.",
  ]},
  { t: "Menej závažné vs. závažné porušenia", src: "čl. XXIV", items: [
    "Menej závažné: neospravedlnených menej ako 8 hodín, neskoré príchody, neprezúvanie, znečisťovanie, fajčenie v areáli.",
    "Závažné: viac ako 3 menej závažné za 3 mesiace, odchod z areálu počas vyučovania, ničenie majetku, falšovanie potvrdení, krádež, šikana.",
    "Opatrenia: napomenutie / pokarhanie triednym, pokarhanie riaditeľom, podmienečné vylúčenie, vylúčenie.",
  ]},
  { t: "Oblečenie a správanie v škole", src: "Etický kódex, čl. XVI; ŠP čl. IV", items: [
    "Uniforma nie je. Príď čistý a primerane upravený; žiadne vulgárne, násilné, extrémistické alebo drogové symboly.",
    "V škole sa prezúvaš, obuv a bundu nechávaš v pridelenej skrinke.",
    "Pri príchode sa vždy zaeviduj svojím čipom – nikdy nie cudzím.",
    "Do budovy nie na kolobežke, skateboarde ani v obuvi s kolieskami.",
  ]},
  { t: "Kde hľadať pomoc", src: "čl. XXV bod 9", items: [
    "Triedny učiteľ, výchovný poradca, ktorýkoľvek mentor, zástupca alebo riaditeľ školy.",
    "Linka detskej istoty: 116 111 alebo 116 000, potrebujem@pomoc.sk",
    "Linka detskej dôvery: 0907 401 749, odkazy@linkadeti.sk",
    "Oznámiť vážny problém nie je „bonzovanie“ – je to ochrana seba alebo druhého.",
  ]},
];

const FAQ = [
  { q: "Meškám 10 minút. Je to absencia?", a: "Nie. Do 15 minút je to neskorý príchod. Nad 15 minút sa to zapíše ako absencia na hodine. (čl. XVII)" },
  { q: "Koľko neskorých príchodov je jedna neospravedlnená hodina?", a: "Príchody sa sčítavajú po minútach, viac ako 3 neskoré príchody sa spravidla hodnotia ako 1 neospravedlnená hodina. (čl. XVII bod 2)" },
  { q: "Bol som chorý 2 dni. Potrebujem od lekára?", a: "Stačí hodnoverný doklad od rodiča cez Edupage/Slack/e-mail do 3 dní od návratu. Lekárske potvrdenie je nutné pri 5+ dňoch za sebou alebo viac ako 10 dňoch za mesiac. Pri častom opakovaní môže škola žiadať potvrdenie aj za kratšie obdobie. (čl. XII)" },
  { q: "Koľko hodín môžem vymeškať z predmetu?", a: "Nad 30 % hodín z predmetu za polrok môže vyučujúci navrhnúť komisionálne preskúšanie. Spočítaj si to v záložke Absencie. (čl. XII bod 7)" },
  { q: "Môžem mať mobil cez prestávku?", a: "Nie. Zákaz platí počas vyučovania aj prestávok. Mobil patrí do skrinky alebo do stojana v triede. (čl. X)" },
  { q: "Môžem si na hodine dať jedlo?", a: "Počas hodiny nie, ak mentor neurčí inak a nerušíš ostatných. Výnimkou je zdravotný dôvod. (Etický kódex čl. III)" },
  { q: "Chcem odísť skôr – kto mi to povolí?", a: "Z poslednej hodiny vyučujúci alebo triedny; z 1 hodiny alebo 1 dňa triedny; z viac dní riaditeľ na písomnú žiadosť. Neplnoletý žiak potrebuje súhlas rodiča. (čl. XI)" },
  { q: "Môžem sa pripojiť na hodinu online z domu?", a: "Áno, výnimočne – žiadosť cez Slack aspoň deň vopred s dôvodom a predpokladanou dĺžkou. Rozhoduje vyučujúci, triedny alebo riaditeľ. (čl. XIII)" },
  { q: "Môžem použiť ChatGPT na zadanie?", a: "Rozhoduje mentor pri konkrétnom zadaní. Ak je AI povolená, dodrž pokyny o priznaní jej použitia. Pri overovaní vedomostí je AI zakázaná. (Etický kódex čl. VI)" },
  { q: "Čo potrebujem na vyznamenanie?", a: "Žiadnu známku horšiu ako 2, priemer z povinných predmetov najviac 1,5 a správanie „veľmi dobré“. (čl. XVIII bod 9)" },
  { q: "Mám päťku na konci roka. Čo teraz?", a: "Ak máš najviac 2 päťky, môžeš so súhlasom riaditeľa robiť opravné skúšky. Ak sa bez dôvodu nedostavíš, ostáva nedostatočný. (čl. XVIII bod 13)" },
  { q: "Kedy je otvorená škola?", a: "V pracovných dňoch 7:00–18:00. Do školy príď najneskôr 10 minút pred začiatkom vyučovania. (čl. IV)" },
  { q: "Môžem ostať v škole po vyučovaní?", a: "Áno – na krúžky, prípravu na hodiny alebo prácu na projektoch v priestoroch školy. (čl. IV bod 16)" },
  { q: "Ako škola komunikuje s rodičmi?", a: "Telefonicky, cez Slack, Edupage alebo e-mail. Známky sú v elektronickej žiackej knižke. (čl. IV bod 18)" },
  { q: "Zabudol som sa čipnúť pri príchode.", a: "Príchod sa eviduje vždy vlastným čipom hneď pri vstupe. Ak sa to stane, ozvi sa triednemu, aby sa dochádzka opravila – kontroluj ju aspoň raz týždenne. (čl. IV bod 3, čl. XVII bod 5)" },
  { q: "Niekto mi ubližuje / vidím šikanu. Komu to povedať?", a: "Triednemu, výchovnému poradcovi, ktorémukoľvek mentorovi alebo vedeniu. Mimo školy: Linka detskej istoty 116 111. (čl. XXV)" },
  { q: "Čo je menej závažné porušenie?", a: "Napr. menej ako 8 neospravedlnených hodín, neskoré príchody, neprezúvanie, znečisťovanie. Viac ako 3 takéto porušenia za 3 mesiace sa už rátajú ako závažné. (čl. XXIV)" },
];
