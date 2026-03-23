// ─────────────────────────────────────────────
// SHARED GRID DATA — full periodic table element list
// Used by all non-CHEM grid layouts for ghost cell rendering.
// Only symbol, z, period, group, catKey are used.
// ─────────────────────────────────────────────

export const ALL_ELEMENTS = [
  ['H',  1,  1,  1,'NONMETAL'],['He', 2,  1, 18,'NOBLE'],
  ['Li', 3,  2,  1,'ALKALI'],  ['Be', 4,  2,  2,'ALKALINE'],['B',  5,  2, 13,'METALLOID'],['C',  6,  2, 14,'NONMETAL'],
  ['N',  7,  2, 15,'NONMETAL'],['O',  8,  2, 16,'NONMETAL'], ['F',  9,  2, 17,'HALOGEN'],  ['Ne', 10, 2, 18,'NOBLE'],
  ['Na', 11, 3,  1,'ALKALI'],  ['Mg', 12, 3,  2,'ALKALINE'],['Al', 13, 3, 13,'POST'],      ['Si', 14, 3, 14,'METALLOID'],
  ['P',  15, 3, 15,'NONMETAL'],['S',  16, 3, 16,'NONMETAL'], ['Cl', 17, 3, 17,'HALOGEN'],  ['Ar', 18, 3, 18,'NOBLE'],
  ['K',  19, 4,  1,'ALKALI'],  ['Ca', 20, 4,  2,'ALKALINE'],['Sc', 21, 4,  3,'TRANSITION'],['Ti', 22, 4,  4,'TRANSITION'],
  ['V',  23, 4,  5,'TRANSITION'],['Cr',24, 4,  6,'TRANSITION'],['Mn',25, 4,  7,'TRANSITION'],['Fe',26, 4,  8,'TRANSITION'],
  ['Co', 27, 4,  9,'TRANSITION'],['Ni',28, 4, 10,'TRANSITION'],['Cu',29, 4, 11,'TRANSITION'],['Zn',30, 4, 12,'TRANSITION'],
  ['Ga', 31, 4, 13,'POST'],    ['Ge', 32, 4, 14,'METALLOID'],['As', 33, 4, 15,'METALLOID'],['Se', 34, 4, 16,'NONMETAL'],
  ['Br', 35, 4, 17,'HALOGEN'], ['Kr', 36, 4, 18,'NOBLE'],
  ['Rb', 37, 5,  1,'ALKALI'],  ['Sr', 38, 5,  2,'ALKALINE'],['Y',  39, 5,  3,'TRANSITION'],['Zr', 40, 5,  4,'TRANSITION'],
  ['Nb', 41, 5,  5,'TRANSITION'],['Mo',42, 5,  6,'TRANSITION'],['Tc',43, 5,  7,'TRANSITION'],['Ru',44, 5,  8,'TRANSITION'],
  ['Rh', 45, 5,  9,'TRANSITION'],['Pd',46, 5, 10,'TRANSITION'],['Ag',47, 5, 11,'TRANSITION'],['Cd',48, 5, 12,'TRANSITION'],
  ['In', 49, 5, 13,'POST'],    ['Sn', 50, 5, 14,'POST'],    ['Sb', 51, 5, 15,'METALLOID'], ['Te', 52, 5, 16,'METALLOID'],
  ['I',  53, 5, 17,'HALOGEN'], ['Xe', 54, 5, 18,'NOBLE'],
  ['Cs', 55, 6,  1,'ALKALI'],  ['Ba', 56, 6,  2,'ALKALINE'],
  ['Hf', 72, 6,  4,'TRANSITION'],['Ta',73, 6,  5,'TRANSITION'],['W', 74, 6,  6,'TRANSITION'],['Re',75, 6,  7,'TRANSITION'],
  ['Os', 76, 6,  8,'TRANSITION'],['Ir',77, 6,  9,'TRANSITION'],['Pt',78, 6, 10,'TRANSITION'],['Au',79, 6, 11,'TRANSITION'],
  ['Hg', 80, 6, 12,'TRANSITION'],['Tl',81, 6, 13,'POST'],    ['Pb', 82, 6, 14,'POST'],    ['Bi', 83, 6, 15,'POST'],
  ['Po', 84, 6, 16,'METALLOID'],['At',85, 6, 17,'HALOGEN'],  ['Rn', 86, 6, 18,'NOBLE'],
  ['Fr', 87, 7,  1,'ALKALI'],  ['Ra', 88, 7,  2,'ALKALINE'],
  ['Rf',104, 7,  4,'TRANSITION'],['Db',105,7,  5,'TRANSITION'],['Sg',106,7,  6,'TRANSITION'],['Bh',107,7,  7,'TRANSITION'],
  ['Hs',108, 7,  8,'TRANSITION'],['Mt',109,7,  9,'TRANSITION'],['Ds',110,7, 10,'TRANSITION'],['Rg',111,7, 11,'TRANSITION'],
  ['Cn',112, 7, 12,'TRANSITION'],['Nh',113,7, 13,'POST'],    ['Fl',114,7, 14,'POST'],     ['Mc',115,7, 15,'POST'],
  ['Lv',116, 7, 16,'POST'],    ['Ts',117, 7, 17,'HALOGEN'],  ['Og',118,7, 18,'NOBLE'],
  // Lanthanides row 9
  ['La', 57, 9,  3,'LANTHANIDE'],['Ce',58, 9,  4,'LANTHANIDE'],['Pr',59, 9,  5,'LANTHANIDE'],['Nd',60, 9,  6,'LANTHANIDE'],
  ['Pm', 61, 9,  7,'LANTHANIDE'],['Sm',62, 9,  8,'LANTHANIDE'],['Eu',63, 9,  9,'LANTHANIDE'],['Gd',64, 9, 10,'LANTHANIDE'],
  ['Tb', 65, 9, 11,'LANTHANIDE'],['Dy',66, 9, 12,'LANTHANIDE'],['Ho',67, 9, 13,'LANTHANIDE'],['Er',68, 9, 14,'LANTHANIDE'],
  ['Tm', 69, 9, 15,'LANTHANIDE'],['Yb',70, 9, 16,'LANTHANIDE'],['Lu',71, 9, 17,'LANTHANIDE'],
  // Actinides row 10
  ['Ac', 89,10,  3,'ACTINIDE'], ['Th',90,10,  4,'ACTINIDE'], ['Pa',91,10,  5,'ACTINIDE'],  ['U', 92,10,  6,'ACTINIDE'],
  ['Np', 93,10,  7,'ACTINIDE'], ['Pu',94,10,  8,'ACTINIDE'], ['Am',95,10,  9,'ACTINIDE'],  ['Cm',96,10, 10,'ACTINIDE'],
  ['Bk', 97,10, 11,'ACTINIDE'], ['Cf',98,10, 12,'ACTINIDE'], ['Es',99,10, 13,'ACTINIDE'],  ['Fm',100,10,14,'ACTINIDE'],
  ['Md',101,10, 15,'ACTINIDE'], ['No',102,10,16,'ACTINIDE'],  ['Lr',103,10,17,'ACTINIDE'],
];
