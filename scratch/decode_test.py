# -*- coding: utf-8 -*-

char_map = {
    'Ŝ': 'С', 'Ŷ': 'л', 'Ź': 'о', 'ŭ': 'в', 'ū': 'а', 'Ż': 'р', 'Ƈ': 'ь',
    'ŝ': 'Т', 'Ű': 'е', 'Ŵ': 'й', 'ů': 'д', 'ų': 'и', 'Ÿ': 'н', 'Ů': 'г',
    'Ž': 'т', 'Ɗ': 'я', 'ſ': 'ф', 'ŷ': 'м', 'Ɔ': 'ы', 'ŵ': 'к', 'Ų': 'з',
    'Ƃ': 'ч', 'œ': 'И', 'ź': 'п', 'Ɓ': 'ц', 'k': '«', 'v': '»', 'ž': 'у',
    'ƃ': 'ш', 'ş': 'Ф', 'ű': 'ж', 'Ƅ': 'щ', 'ŕ': 'К', 'Ō': 'Б', 'Ś': 'П',
    'Ő': 'Е', 'Ŗ': 'Л', 'ŗ': 'М', 'ś': 'Р', 'ō': 'В', 'Š': 'Х', 'ů': 'д',
    'ţ': 'Ш', 'Ũ': 'Э', 'Ř': 'Н', 'š': 'Ц', 'ƣ': '—', 'Ţ': 'Ч', 'ő': 'Ж',
    'Ƌ': 'ё'
}

with open(r'c:\ВСЕ РАЗРАБОТКИ\крипта\cryptolingo-web\scratch\extracted_glossary.txt', 'r', encoding='utf-8') as f:
    raw = f.read()

decoded = raw
for k, v in char_map.items():
    decoded = decoded.replace(k, v)

with open(r'c:\ВСЕ РАЗРАБОТКИ\крипта\cryptolingo-web\scratch\decoded_glossary.txt', 'w', encoding='utf-8') as f:
    f.write(decoded)

print("Decoded file written successfully!")
