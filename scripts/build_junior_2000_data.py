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


def example_for(item):
    term = item["word"]
    pos = item["partOfSpeechZh"]
    lower = term.lower()

    if "介系詞" in pos:
        return f"The notebook is {lower} the desk."
    if "連接詞" in pos:
        if lower == "and":
            return "I like apples and bananas."
        if lower == "or":
            return "You can read or listen."
        if lower == "nor":
            return "He does not sing, nor does he dance."
        if lower == "but":
            return "It is small but useful."
        if lower == "because":
            return "I stayed home because it rained."
        if lower == "if":
            return "Call me if you need help."
        return f"I paused, {lower} I wanted to think."
    if "代名詞" in pos:
        return f"Please use {quote_term(term)} in your answer."
    if "副詞" in pos:
        if lower in {"everywhere", "anywhere", "somewhere", "away", "abroad", "ahead"}:
            return f"We looked {lower} for the answer."
        return f"She speaks English {lower}."
    if "形容詞" in pos:
        return f"The story is {lower}."
    if "動詞" in pos:
        if " " in lower:
            return f"I want to {lower} after class."
        return f"Please {lower} carefully."
    if "感嘆詞" in pos:
        return f"{term}! That was a surprise."
    if "冠詞" in pos:
        return f"I saw {lower} bird in the tree."
    return f"We talked about the {lower} today."


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
                "例句為簡易學習例句，適合先匯入系統使用；正式教材可再人工潤稿。",
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
