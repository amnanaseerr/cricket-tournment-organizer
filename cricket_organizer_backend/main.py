from flask import Flask, request, jsonify
from flask_cors import CORS
from itertools import combinations
from datetime import datetime, timedelta
import random

app = Flask(__name__)
CORS(app)

# Predefined tournaments
TOURNAMENTS = {
    "T20_WC": ["India","Pakistan","Australia","England","South Africa","New Zealand","West Indies","Sri Lanka","Bangladesh","Afghanistan","Netherlands","Ireland"],
    "ODI_WC": ["India","Pakistan","Australia","England","South Africa","New Zealand","West Indies","Sri Lanka","Bangladesh","Afghanistan","Netherlands","Ireland","Zimbabwe","Scotland"],
    "Asia_Cup": ["India","Pakistan","Sri Lanka","Bangladesh","Afghanistan","Nepal"],
    "Champions_Trophy": ["India","Pakistan","Australia","England","South Africa","New Zealand","West Indies","Sri Lanka"]
}

STADIUMS_BY_COUNTRY = {
    "India": ["Wankhede Stadium", "Eden Gardens", "M Chinnaswamy Stadium", "Feroz Shah Kotla"],
    "Pakistan": ["Gaddafi Stadium", "National Stadium Karachi", "Rawalpindi Cricket Stadium"],
    "Australia": ["Melbourne Cricket Ground", "Sydney Cricket Ground", "Adelaide Oval"],
    "England": ["Lord's", "The Oval", "Edgbaston"],
    "South Africa": ["Newlands", "Centurion", "Kingsmead"],
    "New Zealand": ["Eden Park", "Hagley Oval", "Seddon Park"],
    "Sri Lanka": ["R. Premadasa Stadium", "Pallekele Stadium", "Mahinda Rajapaksa Stadium"],
    "Bangladesh": ["Sher-e-Bangla Stadium", "Zohur Ahmed Chowdhury Stadium"],
    "Afghanistan": ["Kabul Stadium"], 
    "Nepal": ["Tribhuvan University Stadium"],
    "West Indies": ["Kensington Oval", "Queen's Park Oval"]
}

MATCH_TIMES = ["10:00 AM", "02:00 PM", "06:00 PM"]  # realistic start times

# Helper functions
def generate_groups(teams):
    random.shuffle(teams)
    mid = len(teams)//2
    return teams[:mid], teams[mid:]

def schedule_group_matches(group_teams, start_date, stadiums, group_name, start_offset_days=0):
    matches = list(combinations(group_teams, 2))
    random.shuffle(matches)
    schedule = []
    current_date = start_date + timedelta(days=start_offset_days)
    stadium_index = 0
    for match in matches:
        schedule.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "time": random.choice(MATCH_TIMES),
            "teams": list(match),
            "stadium": stadiums[stadium_index % len(stadiums)],
            "group": group_name
        })
        current_date += timedelta(days=2)  # alternate days
        stadium_index += 1
    return schedule

def schedule_knockouts(qualified_teams, start_date, stadiums):
    schedule = []
    current_date = start_date
    stadium_index = 0
    while len(qualified_teams) > 1:
        schedule.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "time": random.choice(MATCH_TIMES),
            "teams": ["Team A", "Team B"],  # Placeholder
            "stadium": stadiums[stadium_index % len(stadiums)],
            "group": "Knockout"
        })
        current_date += timedelta(days=2)
        stadium_index += 1
        qualified_teams = qualified_teams[2:]
    return schedule

@app.route("/generate_schedule", methods=["POST"])
def generate_schedule():
    data = request.json
    tournament_name = data.get("tournament")
    start_date_str = data.get("start_date")
    host_country = data.get("host_country")

    if not tournament_name or tournament_name not in TOURNAMENTS:
        return jsonify({"error": "Unknown tournament"}), 400
    if not start_date_str:
        return jsonify({"error": "Start date required"}), 400
    if not host_country or host_country not in STADIUMS_BY_COUNTRY:
        return jsonify({"error": "Unknown host country"}), 400

    teams = TOURNAMENTS[tournament_name]
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    stadiums = STADIUMS_BY_COUNTRY[host_country]

    group_a, group_b = generate_groups(teams)
    group_a_schedule = schedule_group_matches(group_a, start_date, stadiums, "A", start_offset_days=0)
    group_b_schedule = schedule_group_matches(group_b, start_date, stadiums, "B", start_offset_days=1)
    group_schedule = group_a_schedule + group_b_schedule
    group_schedule.sort(key=lambda x: x["date"])

    qualified = [group_a[0], group_a[1], group_b[0], group_b[1]]
    knockout_schedule = schedule_knockouts(qualified, start_date + timedelta(days=len(group_schedule)), stadiums)

    return jsonify({
        "tournament": tournament_name,
        "host_country": host_country,
        "groups": {"A": group_a, "B": group_b},
        "group_matches": group_schedule,
        "knockout_matches": knockout_schedule
    })

@app.route("/", methods=["GET"])
def home():
    return "Flask backend is running!"

if __name__ == "__main__":
    app.run(debug=True)
