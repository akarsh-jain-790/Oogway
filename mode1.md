# 🏠 MODE 1 — “Choose a Place to Live”

## 🎬 Entry Flow

**Step 1: Intent Selection**

- Screen: “What are you planning?”
    - 🏠 Choose a Place to Live
    - 🚗 Plan a Place to Go

User taps **Choose a Place to Live**

---

## 🧭 Step 2: Anchor Collection

Screen: “Where does your life orbit?”

User inputs:

- 📍 Workplace (Map pin or search)
- ➕ Add Frequent Places
    - Gym
    - Partner
    - Family
    - School
    - etc.

System stores these as **weighted commute anchors**.

---

## 🎚 Step 3: Lifestyle Calibration

Instead of boring forms, use sliders.

User sets:

- ⏱ Commute Priority (slider)
- 🍔 Delivery Importance
- 🔇 Quiet vs 🌃 Nightlife
- 🎉 Festival Tolerance
- 🏫 Schools Importance
- 🏥 Hospitals Importance
- 🛕 Cultural Proximity Importance

This builds a **Preference Vector**.

---

## 🧠 Step 4: System Processing

Behind the curtain:

1. Map anchors to zone graph
2. Compute:
    - Time-weighted commute score
    - Festival disruption probability
    - Infrastructure density score
    - Service reliability score
3. Normalize scores
4. Apply preference weights
5. Rank zones

---

## 📊 Step 5: Results Screen

User sees:

### Top 3 Recommended Zones

Each card shows:

- 🚦 Commute: 28 min peak
- 🍔 Delivery reliability: High
- 🎉 Festival impact: Moderate evenings
- 🔊 Noise profile: Low daytime, active weekends
- 🌧 Monsoon risk: Low

Tap a zone → Detailed breakdown.

---

## 🔄 Step 6: Interactive Refinement

User can:

- Adjust sliders live
- Remove/add anchors
- Toggle “What if I work remote 2 days/week?”

Results update instantly.

---

## 🧾 Step 7: Save / Compare

User can:

- Compare 2 zones side-by-side
- Save shortlist
- Export summary

---