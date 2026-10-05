# -*- coding: utf-8 -*-
import json
import math

# We create the 100-lesson generator
from build_all_modules import modules

def generate_candles(seed_price, trend='UP', count=7):
    candles = []
    current = seed_price
    for i in range(count):
        if trend == 'UP':
            delta = 100 + (i * 35)
            open_p = current
            close_p = current + delta
            high_p = close_p + (delta * 0.3)
            low_p = open_p - (delta * 0.2)
        elif trend == 'DOWN':
            delta = 100 + (i * 35)
            open_p = current
            close_p = current - delta
            high_p = open_p + (delta * 0.2)
            low_p = close_p - (delta * 0.3)
        elif trend == 'PINBAR_BULL':
            if i == count - 2: # the pinbar
                open_p = current
                close_p = current + 50
                high_p = close_p + 30
                low_p = open_p - 450 # long wick
            elif i == count - 1: # reaction
                open_p = current + 50
                close_p = current + 350
                high_p = close_p + 50
                low_p = open_p - 20
            else:
                open_p = current
                close_p = current - 80
                high_p = open_p + 30
                low_p = close_p - 40
        else: # RANGE
            delta = 60 if i % 2 == 0 else -60
            open_p = current
            close_p = current + delta
            high_p = max(open_p, close_p) + 40
            low_p = min(open_p, close_p) - 40
        
        current = close_p
        candles.append({
            "time": f"2024-{(i//28)+1:02d}-{(i%28)+1:02d}",
            "open": round(open_p, 1),
            "high": round(high_p, 1),
            "low": round(low_p, 1),
            "close": round(close_p, 1)
        })
    return candles

full_modules = []

for mod_idx, mod in enumerate(modules):
    m_num = mod["number"]
    m_id = mod["id"]
    lessons = []
    
    for l_idx, (title, short_desc, icon) in enumerate(mod["lessons_meta"]):
        lesson_num = l_idx + 1
        lesson_id = f"lesson-{m_num}-{lesson_num}"
        
        # Decide action type and candles
        if lesson_num in [1, 2, 5, 6]:
            action_type = "find_candle"
            initial_candles = generate_candles(40000 + m_num * 2500 + l_idx * 300, 'PINBAR_BULL', 7)
            target_candle_index = 5
            practice_dict = {
                "symbol": "BTC/USDT",
                "timeframe": "1D",
                "instruction": f"Найдите на графике свечу ключевого сигнала для темы «{title}» и нажмите на нее.",
                "hint": "Ищите свечу с максимальной реакцией рынка или длинной тенью поглощения.",
                "actionType": "find_candle",
                "targetCandleIndex": target_candle_index,
                "initialCandles": initial_candles
            }
        elif lesson_num in [3, 4, 7]:
            action_type = "draw_level"
            base_price = 40000 + m_num * 2500 + l_idx * 300
            initial_candles = generate_candles(base_price, 'RANGE', 7)
            target_level = round(base_price - 50, 0)
            practice_dict = {
                "symbol": "ETH/USDT",
                "timeframe": "4H",
                "instruction": f"Установите горизонтальный уровень поддержки/сопротивления для отработки темы «{title}».",
                "hint": f"Проведите линию через скопление минимумов/максимумов около отметки {int(target_level)}.",
                "actionType": "draw_level",
                "targetLevelPrice": target_level,
                "tolerancePercent": 2.5,
                "initialCandles": initial_candles
            }
        elif lesson_num in [8, 9]:
            action_type = "predict_trend"
            base_price = 30000 + m_num * 3000 + l_idx * 400
            initial_candles = generate_candles(base_price, 'UP', 5)
            future_candles = generate_candles(initial_candles[-1]["close"], 'UP', 3)
            practice_dict = {
                "symbol": "SOL/USDT",
                "timeframe": "1D",
                "instruction": f"Оцените рыночную структуру по теме «{title}» и укажите дальнейшее направление цены.",
                "hint": "Последовательность повышающихся максимумов и сильный импульс подтверждают продолжение движения.",
                "actionType": "predict_trend",
                "expectedDirection": "LONG",
                "initialCandles": initial_candles,
                "futureCandles": future_candles
            }
        else: # 10
            action_type = "place_trade"
            base_price = 50000 + m_num * 2000
            initial_candles = generate_candles(base_price, 'RANGE', 5)
            future_candles = generate_candles(initial_candles[-1]["close"], 'UP', 3)
            practice_dict = {
                "symbol": "BTC/USDT",
                "timeframe": "1D",
                "instruction": f"Откройте позицию с соблюдением риск-менеджмента (RR не менее 1:3) по сетапу «{title}».",
                "hint": "Установите стоп-лосс за локальный экстремум и тейк-профит на ключевое сопротивление.",
                "actionType": "place_trade",
                "expectedDirection": "LONG",
                "minRiskReward": 3.0,
                "initialCandles": initial_candles,
                "futureCandles": future_candles
            }
        
        # High quality theory tailored to the title
        theory_data = {
            "title": f"Концепт: {title}",
            "badge": f"{mod['badge']} // Урок {lesson_num:02d}",
            "points": [
                {
                    "headline": f"1. Механика и логика: {title}",
                    "text": f"В профессиональном трейдинге {title.lower()} отражает прямое взаимодействие рыночного спроса и предложения. Каждый ценовой маневр оставляет следы в виде объемов и формы свечей.",
                    "highlight": f"Ключевая цель трейдера — объективно распознавать сигналы рынка без субъективных ожиданий и иллюзий.",
                    "badgeType": "bull" if lesson_num % 2 == 1 else "info"
                },
                {
                    "headline": "2. Практическое применение в торговой системе",
                    "text": f"{short_desc} Использование данного инструмента в сочетании со старшим таймфреймом повышает вероятность успешной отработки сценария.",
                    "highlight": "Никогда не входите в сделку изолированно по одному фактору. Ищите совпадение минимум 2-3 независимых подтверждений.",
                    "badgeType": "warning"
                },
                {
                    "headline": "3. Риск-контроль и ошибки большинства",
                    "text": "Большинство розничных участников теряют капитал из-за поспешных входов до закрытия бара и пренебрежения стоп-приказами.",
                    "highlight": "Стоп-лосс выставляется строго ДО входа в сделку и рассчитывается от технической точки отмены идеи, а не от желаемой суммы убытка.",
                    "badgeType": "bear"
                }
            ],
            "proTip": f"При анализе темы «{title}» всегда ориентируйтесь на закрытие свечи на основном рабочем таймфрейме.",
            "authorQuote": "«Рынок вознаграждает терпеливых и дисциплинированных трейдеров, строго следующих алгоритму»."
        }
        
        quiz_data = [
            {
                "id": f"q-{m_num}-{lesson_num}-1",
                "question": f"В чем заключается главная практическая суть темы «{title}»?",
                "options": [
                    f"Идентификация объективного дисбаланса спроса и предложения на рынке",
                    "Попытка угадать точный разворот рынка без подтверждения",
                    "Торговля максимальным кредитным плечом на новостях",
                    "Случайный выбор направления сделки"
                ],
                "correctIndex": 0,
                "explanation": "Профессиональный подход базируется на оценке распределения ликвидности и поведения крупных участников рынка."
            },
            {
                "id": f"q-{m_num}-{lesson_num}-2",
                "question": "Какое ключевое правило риск-менеджмента необходимо соблюдать при отработке данного сетапа?",
                "options": [
                    "Определить уровень стоп-лосса и точку отмены сценария до открытия позиции",
                    "Передвигать стоп-лосс дальше в минус при движении против позиции",
                    "Удваивать объем сделки при получении убытка (мартингейл)",
                    "Торговать без стоп-лосса в надежде на скорый отскок"
                ],
                "correctIndex": 0,
                "explanation": "Заранее определенная точка отмены сетапа защищает капитал от катастрофических неконтролируемых просадок."
            }
        ]
        
        lesson_obj = {
            "id": lesson_id,
            "moduleId": m_id,
            "title": title,
            "shortDesc": short_desc,
            "icon": icon,
            "xpReward": 40 + (m_num * 5),
            "coinReward": 80 + (m_num * 10),
            "theory": theory_data,
            "quiz": quiz_data,
            "practice": practice_dict
        }
        lessons.append(lesson_obj)
        
    full_modules.append({
        "id": m_id,
        "number": m_num,
        "title": mod["title"],
        "description": mod["description"],
        "badge": mod["badge"],
        "accentColor": mod["accentColor"],
        "lessons": lessons,
        "requiredXp": (m_num - 1) * 350
    })

# Write to src/data/courses.ts
ts_content = f"""import type {{ Module }} from '../types';

export const COURSE_MODULES: Module[] = {json.dumps(full_modules, ensure_ascii=False, indent=2)};
"""

target_path = r"c:\ВСЕ РАЗРАБОТКИ\крипта\cryptolingo-web\src\data\courses.ts"
with open(target_path, "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"Successfully generated 10 modules and {sum(len(m['lessons']) for m in full_modules)} lessons into courses.ts!")
