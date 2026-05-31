#!/usr/bin/env python3
import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path

import eng_to_ipa as ipa
import pdfplumber


CATEGORIES = [
    (1, 32, "people_roles", "人物稱謂", "先記誰是誰：人、角色、關係中的稱呼。"),
    (33, 53, "appearance", "外貌描述", "用身高、體型、外表特徵幫助畫面記憶。"),
    (54, 119, "personality_emotions", "個性與情緒", "用人的個性、心情和態度來成組記憶。"),
    (120, 180, "body_health", "身體與健康", "把身體部位、病痛和健康照護放在一起。"),
    (181, 205, "family_life", "家庭與人生", "家庭成員、成長、婚姻和生活動詞。"),
    (206, 251, "numbers_amounts", "數字與數量", "基礎數字、序數和數量詞。"),
    (252, 320, "time_calendar", "時間與日期", "一天、一週、月份、季節和時間副詞。"),
    (321, 339, "money_shopping", "金錢與購物", "錢、價格、買賣和花費。"),
    (340, 466, "food_drinks_tableware", "食物飲料與餐具", "食材、餐點、味道、烹調與用餐器具。"),
    (467, 526, "clothes_colors_materials", "衣物顏色與材質", "穿著、配件、顏色和常見材質。"),
    (527, 597, "sports_hobbies_entertainment", "運動休閒與娛樂", "球類、戶外活動、音樂、電影和興趣。"),
    (598, 696, "home_living_objects", "住家與生活用品", "房屋空間、家具、家電和家事。"),
    (697, 807, "school_learning", "學校與學習", "校園、文具、科目、學習動作和考試。"),
    (808, 820, "directions_positions", "方位與位置", "前後左右、東西南北和位置詞。"),
    (821, 867, "places_community", "場所與社區", "商店、公共場所、城市與鄉村。"),
    (868, 913, "transportation_movement", "交通與移動", "交通工具、道路、車站和移動動詞。"),
    (914, 971, "measurement_shapes", "度量形狀與大小", "單位、形狀、大小、高低與數量容器。"),
    (972, 994, "festivals_culture", "節慶與文化", "節日、假期、文化和慶祝。"),
    (995, 1046, "jobs_work", "職業與工作", "職業名稱、公司、雇用和工作情境。"),
    (1047, 1075, "weather", "天氣", "晴雨冷熱、風、雷、颱風與天氣動詞。"),
    (1076, 1109, "nature_landforms", "自然與地景", "天空、地球、山河海洋和自然環境。"),
    (1110, 1177, "animals", "動物", "家畜、野生動物、昆蟲、海洋生物和動物動作。"),
    (1178, 1245, "pronouns_questions", "代名詞與疑問詞", "this、that、人稱代名詞、不定代名詞與疑問詞。"),
    (1246, 1300, "prepositions_conjunctions", "介系詞與連接詞", "句子關係、位置、原因、轉折和連接。"),
    (1301, 1569, "daily_abstract_nouns", "生活與抽象名詞", "事件、物品、社會、想法、結果、系統與抽象概念。"),
    (1570, 1619, "senses_mind_feelings", "感官思考與情緒動詞", "看聽聞嚐、相信、記得、希望和擔心。"),
    (1620, 1729, "daily_actions", "日常動作", "身體動作、手部操作、移動和生活常用動詞。"),
    (1730, 1858, "communication_decision_actions", "溝通決定與社會動作", "同意、比較、描述、邀請、提供、尊重等互動動詞。"),
    (1859, 1968, "general_adjectives", "常用形容詞", "狀態、程度、評價、可能性和特色形容詞。"),
    (1969, 2000, "adverbs_sentence_links", "副詞與句子連接", "頻率、程度、地點、順序與句子連接詞。"),
]

CUSTOM_IPA = {
    "stomachache": "ˈstʌməkˌeɪk",
    "toothache": "ˈtuːθˌeɪk",
    "workbook": "ˈwɜːrkˌbʊk",
    "women's room": "ˈwɪmɪnz ruːm",
    "women’s room": "ˈwɪmɪnz ruːm",
}

POS_CODES = [
    ("名詞", "n."),
    ("動詞", "v."),
    ("形容詞", "adj."),
    ("副詞", "adv."),
    ("代名詞", "pron."),
    ("介系詞", "prep."),
    ("連接詞", "conj."),
    ("感嘆詞", "interj."),
    ("冠詞", "art."),
    ("助動詞", "aux."),
]


def clean_cell(value):
    if value is None:
        return ""
    return re.sub(r"\s+", "", str(value).replace("\n", "")).strip()


def clean_term(value):
    return re.sub(r"\s+", " ", str(value).replace("\n", " ")).strip()


def extract_entries(pdf_path):
    entries = []
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page_index, page in enumerate(pdf.pages, start=1):
            for table in page.extract_tables():
                for row in table[1:]:
                    for offset in (0, 4):
                        if len(row) <= offset + 3:
                            continue
                        raw_id = clean_cell(row[offset])
                        if not raw_id.isdigit():
                            continue
                        entries.append(
                            {
                                "id": int(raw_id),
                                "word": clean_term(row[offset + 1]),
                                "partOfSpeechZh": clean_cell(row[offset + 2]),
                                "meaningZh": clean_cell(row[offset + 3]),
                                "sourcePage": page_index,
                            }
                        )
    entries.sort(key=lambda item: item["id"])
    ids = [item["id"] for item in entries]
    expected = list(range(1, 2001))
    if ids != expected:
        missing = sorted(set(expected) - set(ids))
        duplicates = sorted({item_id for item_id in ids if ids.count(item_id) > 1})
        raise RuntimeError(f"PDF extraction mismatch. missing={missing[:20]} duplicates={duplicates[:20]}")
    return entries


def category_for(word_id):
    for start, end, category_id, name, note in CATEGORIES:
        if start <= word_id <= end:
            return {
                "categoryId": category_id,
                "categoryNameZh": name,
                "categoryNoteZh": note,
            }
    raise ValueError(f"No category for id {word_id}")


def normalize_for_ipa(term):
    normalized = term.replace("’", "'")
    normalized = normalized.replace("Dragon-boat", "Dragon boat")
    normalized = normalized.replace("T-shirt", "T shirt")
    normalized = normalized.replace("o’clock", "o clock")
    normalized = normalized.replace("New Year's", "New Years")
    normalized = normalized.replace("men's", "mens")
    normalized = normalized.replace("women's", "women's")
    normalized = normalized.replace("-", " ")
    return normalized


def to_ipa(term):
    if term in CUSTOM_IPA:
        return f"/{CUSTOM_IPA[term]}/", False
    normalized = normalize_for_ipa(term)
    if normalized in CUSTOM_IPA:
        return f"/{CUSTOM_IPA[normalized]}/", False
    converted = ipa.convert(normalized)
    needs_review = "*" in converted
    converted = converted.replace("*", "")
    converted = re.sub(r"\s+", " ", converted).strip()
    return f"/{converted}/", needs_review


def pos_code(part_of_speech_zh):
    codes = [code for zh, code in POS_CODES if zh in part_of_speech_zh]
    return "/".join(codes) if codes else ""


def quote_term(term):
    return f'"{term}"'


def starts_with_vowel_sound(term):
    return term[:1].lower() in {"a", "e", "i", "o", "u"}


def with_article(term):
    if " " in term or term.endswith("s") or term[:1].isupper():
        return f"the {term}"
    article = "an" if starts_with_vowel_sound(term) else "a"
    return f"{article} {term}"


def noun_phrase(term):
    lower = term.lower()
    if lower in {"i", "you", "he", "she", "it", "we", "they"}:
        return term
    if term[:1].isupper() or "day" in lower or lower in {"today", "tonight", "tomorrow", "yesterday"}:
        return term
    return with_article(lower)


def preposition_example(lower):
    examples = {
        "about": "We had a serious discussion about the school project.",
        "above": "The sign above the door tells visitors where to go.",
        "across": "After we walked across the bridge, the station was easy to find.",
        "after": "After dinner, I reviewed the words that I had missed.",
        "against": "The ladder was leaning against the wall when I arrived.",
        "along": "We picked up trash along the river because the park was crowded.",
        "among": "Among all the choices, this answer seems the most reasonable.",
        "at": "I will meet you at the library when the class ends.",
        "before": "Before the test began, the teacher explained the rules.",
        "behind": "The notebook that I lost was behind the computer.",
        "below": "The temperature fell below ten degrees, so we wore coats.",
        "beside": "She sat beside her brother while they were waiting.",
        "between": "The answer is between the two numbers on the chart.",
        "beyond": "The village beyond the hill is famous for its old temple.",
        "by": "The report was written by a student who loves science.",
        "down": "He ran down the stairs after he heard the bell.",
        "during": "During the meeting, everyone listened carefully.",
        "except": "Everyone finished the homework except one student.",
        "for": "This message is for anyone who needs extra practice.",
        "from": "I borrowed a dictionary from the library yesterday.",
        "in": "The keys were in the drawer that was beside the bed.",
        "in back of": "The bicycles are in back of the classroom building.",
        "in front of": "Please wait in front of the station after school.",
        "inside": "The letter was inside the envelope that I found.",
        "into": "The teacher divided the class into four small groups.",
        "like": "This fruit tastes like the mangoes we ate last summer.",
        "near": "The apartment near the park is quiet at night.",
        "of": "The cover of the book was damaged by the rain.",
        "off": "Please turn off the light before you leave.",
        "on": "The schedule on the wall shows every activity.",
        "out of": "She took the ticket out of her pocket before boarding.",
        "outside": "We waited outside the museum until it opened.",
        "over": "A plane flew over the city while we were walking.",
        "next to": "The bakery next to the bank sells fresh bread.",
        "since": "I have known him since we were in elementary school.",
        "than": "This route is faster than the one we took yesterday.",
        "through": "Sunlight came through the window and warmed the room.",
        "to": "We walked to the bus stop because the weather was nice.",
        "toward": "The dog ran toward its owner as soon as it heard her voice.",
        "under": "The cat slept under the table while we studied.",
        "until": "I practiced until I could pronounce the sentence clearly.",
        "up": "She climbed up the hill although she was tired.",
        "with": "He solved the problem with a method that he learned in class.",
        "without": "You cannot finish the project without careful planning.",
    }
    return examples.get(lower, f"The phrase uses {quote_term(lower)} to show the relationship between two ideas.")


def conjunction_example(lower):
    examples = {
        "and": "I checked the answer and explained why it was correct.",
        "because": "She stayed after class because she wanted to ask another question.",
        "besides": "Besides learning new words, we practiced how to use them in sentences.",
        "but": "The word looks easy, but it can be difficult to use correctly.",
        "however": "The first answer sounded right; however, the second one was more accurate.",
        "if": "If you review a little every day, the test will feel less stressful.",
        "or": "You can write an example sentence or say it aloud.",
        "since": "Since the lesson was important, I copied the notes carefully.",
        "than": "This sentence is clearer than the one I wrote before.",
        "therefore": "He practiced every night; therefore, his pronunciation improved.",
        "though": "Though the word was unfamiliar, I guessed its meaning from the context.",
        "while": "While my sister was reading, I was reviewing vocabulary.",
        "whether": "The teacher asked whether we understood the difference.",
        "nor": "He did not complain, nor did he stop trying.",
        "either": "If you do not know the answer, I do not know it either.",
    }
    return examples.get(lower, f"I used {quote_term(lower)} to connect two ideas in one sentence.")


def pronoun_example(term):
    lower = term.lower()
    examples = {
        "i": "I finished the worksheet before the bell rang.",
        "me": "The teacher asked me to read the sentence aloud.",
        "my": "My notebook has examples that help me review.",
        "mine": "This pencil is mine, but you may borrow it.",
        "myself": "I checked the answer myself before asking for help.",
        "you": "You should explain the reason, not just choose an answer.",
        "your": "Your sentence will be stronger if you add more details.",
        "yours": "This dictionary is yours, so please keep it on your desk.",
        "yourself": "Try to correct the mistake yourself first.",
        "yourselves": "You should prepare yourselves before the final test.",
        "he": "He raised his hand because he knew the answer.",
        "him": "I helped him understand the difficult paragraph.",
        "his": "His example was clearer than mine.",
        "himself": "He introduced himself before the interview began.",
        "she": "She wrote a sentence that included a relative clause.",
        "her": "The coach told her to practice after school.",
        "hers": "The red umbrella is hers, not mine.",
        "herself": "She taught herself how to pronounce the word.",
        "it": "It became easier after we saw another example.",
        "its": "The school changed its schedule because of the typhoon.",
        "itself": "The machine turns itself off when it gets too hot.",
        "we": "We compared our answers before the teacher explained them.",
        "us": "The story reminded us that small choices matter.",
        "our": "Our group presented the project after lunch.",
        "ours": "The final decision was ours to make.",
        "ourselves": "We prepared ourselves for a longer test.",
        "they": "They discussed the problem until they found a solution.",
        "them": "I put the cards on the table and mixed them.",
        "their": "Their idea was creative, although it needed more detail.",
        "theirs": "The books on the front desk are theirs.",
        "themselves": "They introduced themselves politely to the visitors.",
    }
    if lower in examples:
        return examples[lower]
    return f"When writers use {quote_term(term)}, they replace or point to a noun in the sentence."


def verb_phrase(term):
    lower = term.lower()
    phrases = {
        "avoid": "avoid making the same mistake",
        "feel": "feel more confident",
        "hear": "hear the announcement clearly",
        "listen": "listen to the speaker carefully",
        "look": "look for clues in the paragraph",
        "see": "see the difference between the two answers",
        "smell": "smell the smoke before anyone saw the fire",
        "sound": "sound confident during the presentation",
        "taste": "taste the soup before adding more salt",
        "watch": "watch the experiment from beginning to end",
        "appear": "appear calm during the interview",
        "become": "become more independent",
        "belong": "belong to a group that shares the same goal",
        "die": "die out if people stop using it",
        "disappear": "disappear before anyone noticed",
        "exist": "exist in more than one form",
        "fall": "fall behind if we stop practicing",
        "go": "go through the notes again",
        "happen": "happen when people ignore the warning",
        "lie": "lie on the grass and watch the clouds",
        "rise": "rise slowly as the temperature increases",
        "run": "run faster than we expected",
        "seem": "seem easier after one clear example",
        "sleep": "sleep well before an important test",
        "stay": "stay focused until the work is finished",
        "wait": "wait until everyone is ready",
        "wake": "wake up before the alarm rings",
        "walk": "walk across the bridge after school",
        "live": "live in a city that has convenient transportation",
        "grow": "grow stronger through regular practice",
        "marry": "marry someone who respects their dreams",
        "rain": "rain heavily during the afternoon",
        "shine": "shine through the window in the morning",
        "blow": "blow across the open field",
        "arrive": "arrive before the meeting begins",
        "land": "land safely after the long flight",
        "sail": "sail across the lake on a windy day",
    }
    if lower in phrases:
        return phrases[lower]
    if " " in lower:
        return lower
    return f"{lower} the idea in a real situation"


def example_for(item):
    term = item["word"]
    pos = item["partOfSpeechZh"]
    lower = term.lower()
    index = item["id"] % 6

    if "介系詞" in pos:
        return preposition_example(lower)
    if "連接詞" in pos:
        return conjunction_example(lower)
    if "代名詞" in pos:
        return pronoun_example(term)
    if "副詞" in pos:
        if lower == "however":
            return "The plan sounded simple; however, it required careful timing."
        if lower == "therefore":
            return "The evidence was clear; therefore, we changed our answer."
        if lower == "either":
            return "I did not understand the question either, so I asked for help."
        if lower in {"everywhere", "anywhere", "somewhere", "away", "abroad", "ahead"}:
            return f"Although we looked {lower}, we still could not find the missing key."
        if lower in {"always", "ever", "never", "often", "seldom", "sometimes", "usually"}:
            return f"She {lower} reviews her notes before she goes to bed."
        templates = [
            f"She answered the question {lower} because she had prepared well.",
            f"If you listen {lower}, you may notice the speaker's main point.",
            f"The team worked {lower} until the project was finished.",
            f"He spoke {lower}, which made the instructions easier to follow.",
            f"After the bell rang, the students moved {lower} to the next room.",
            f"The result was {lower} different from what we had expected.",
        ]
        return templates[index]
    if "形容詞" in pos:
        noun = "situation" if "人" not in item["meaningZh"] else "person"
        templates = [
            f"Although the {noun} seemed {lower}, we tried to understand the reason.",
            f"The answer became {lower} after the teacher added one example.",
            f"If a task is {lower}, you should break it into smaller steps.",
            f"The story was so {lower} that everyone wanted to discuss it.",
            f"I chose a {lower} example because it matched the grammar pattern.",
            f"When the room grew {lower}, the students began to speak more softly.",
        ]
        return templates[index]
    if "動詞" in pos:
        phrase = verb_phrase(term)
        templates = [
            f"Although I wanted to {phrase} quickly, I slowed down and checked the details.",
            f"The teacher asked us to {phrase} before we wrote our answers.",
            f"If you can {phrase}, the word will be easier to remember.",
            f"We learned how to {phrase} while we were practicing the dialogue.",
            f"After they managed to {phrase}, the group made a clear plan.",
            f"Please try to {phrase} so that everyone understands what you mean.",
        ]
        return templates[index]
    if "感嘆詞" in pos:
        return f"{term}! I did not expect the answer to be so surprising."
    if "冠詞" in pos:
        return f"I saw {lower} old picture that reminded me of our first lesson."
    phrase = noun_phrase(term)
    templates = [
        f"Although {phrase} seemed simple at first, it helped us understand the whole topic.",
        f"When we discussed {phrase}, the teacher asked us to give a more specific example.",
        f"I compared {phrase} with another idea so that the difference would be clear.",
        f"If you remember {phrase} in context, you will use the word more naturally.",
        f"The report that mentioned {phrase} was easier to understand than I expected.",
        f"After reading the paragraph, I wrote one sentence about {phrase}.",
    ]
    return templates[index]


def study_hint(item):
    category = category_for(item["id"])
    meaning = item["meaningZh"]
    return f"把「{item['word']}」和「{category['categoryNameZh']}」情境連在一起：{meaning}。"


def build_payload(entries, source_pdf):
    words = []
    needs_ipa_review = []
    for item in entries:
        ipa_text, needs_review = to_ipa(item["word"])
        if needs_review:
            needs_ipa_review.append(item["id"])
        category = category_for(item["id"])
        words.append(
            {
                "id": item["id"],
                "word": item["word"],
                "partOfSpeechZh": item["partOfSpeechZh"],
                "partOfSpeech": pos_code(item["partOfSpeechZh"]),
                "meaningZh": item["meaningZh"],
                "ipa": ipa_text,
                "exampleEn": example_for(item),
                "categoryId": category["categoryId"],
                "categoryNameZh": category["categoryNameZh"],
                "categoryNoteZh": category["categoryNoteZh"],
                "studyHintZh": study_hint(item),
                "groupOfFive": (item["id"] - 1) // 5 + 1,
                "sourcePage": item["sourcePage"],
            }
        )

    return {
        "meta": {
            "title": "國中單字王 2000 單字題庫表資料化",
            "sourcePdf": Path(source_pdf).name,
            "sourceTotal": len(words),
            "formatVersion": 1,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "notesZh": [
                "英文、詞性、中文意思由 PDF 表格抽取。",
                "主題分類依 PDF 主題排序與學習情境重新命名，方便初學者分組記憶。",
                "IPA 由英語發音字典批次產生，少數複合詞採人工校正。",
                "例句以中等英文能力為目標，使用條件句、讓步句、關係子句、比較、結果與時間子句等句型。",
            ],
            "ipaNeedsReviewIds": needs_ipa_review,
        },
        "categories": [
            {
                "id": category_id,
                "nameZh": name,
                "range": [start, end],
                "descriptionZh": note,
            }
            for start, end, category_id, name, note in CATEGORIES
        ],
        "words": words,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--output", type=Path, default=Path("data/junior-2000-vocabulary.json"))
    args = parser.parse_args()

    entries = extract_entries(args.pdf)
    payload = build_payload(entries, args.pdf)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(payload['words'])} words to {args.output}")
    print(f"IPA needs review: {len(payload['meta']['ipaNeedsReviewIds'])}")


if __name__ == "__main__":
    main()
