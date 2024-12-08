# utilities.py
import logging
from logging.handlers import RotatingFileHandler
import os
from flask import jsonify, abort
from flask_jwt_extended import get_jwt_identity
from models import db, User
import swisseph as swe
from datetime import datetime, time, timedelta
from constants import planet_indices
import pytz
from skyfield.api import load, wgs84
from skyfield.data import mpc
from skyfield.constants import GM_SUN_Pitjeva_2005_km3_s2 as GM_SUN
from timezonefinder import TimezoneFinder

logging.basicConfig(level=logging.DEBUG)
tf = TimezoneFinder()




def get_timezone(latitude, longitude):
    timezone_str = tf.certain_timezone_at(lat=latitude, lng=longitude)
    if timezone_str is None:
        logging.warning(f"Couldn't determine timezone for lat:{latitude}, lon:{longitude}. Using UTC.")
        return 'UTC'
    return timezone_str

def calculate_julian_day(year, month, day, hour, minute, second, latitude, longitude):
    timezone_str = get_timezone(latitude, longitude)
    local_time = datetime(year, month, day, hour, minute, second)
    local_tz = pytz.timezone(timezone_str)
    local_time_with_tz = local_tz.localize(local_time)
    utc_time = local_time_with_tz.astimezone(pytz.UTC)

    jd = swe.julday(utc_time.year, utc_time.month, utc_time.day,
                    utc_time.hour + utc_time.minute/60.0 + utc_time.second/3600.0,
                    swe.GREG_CAL)
    logging.debug(f"Julian Day: {jd}")
    return jd

def calculate_sun_sign(jd):
    flags = swe.FLG_SWIEPH | swe.FLG_SPEED
    sun_pos, _ = swe.calc_ut(jd, swe.SUN, flags)
    logging.debug(f"Sun position: {sun_pos}")
    return get_zodiac_sign(sun_pos[0])

def calculate_moon_sign(jd):
    flags = swe.FLG_SWIEPH | swe.FLG_SPEED
    moon_pos, _ = swe.calc_ut(jd, swe.MOON, flags)
    logging.debug(f"Moon position: {moon_pos}")
    return get_zodiac_sign(moon_pos[0])

def calculate_ascendant(jd, lat, lon):
    cusps, ascmc = swe.houses_ex(jd, lat, lon, hsys=b'P')
    logging.debug(f"Ascendant: {ascmc[0]}")
    return get_zodiac_sign(ascmc[0])

def get_zodiac_sign(longitude):
    signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
             "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    sign_index = int(longitude / 30)
    logging.debug(f"Longitude: {longitude}, Sign: {signs[sign_index]}")
    return signs[sign_index]

def generate_personalized_message(birth_date, birth_time, latitude, longitude):
        jd = calculate_julian_day(birth_date.year, birth_date.month, birth_date.day,
                                  birth_time.hour, birth_time.minute,         birth_time.second,
                                  latitude, longitude)
        sun_sign = calculate_sun_sign(jd)
        moon_sign = calculate_moon_sign(jd)
        ascendant = calculate_ascendant(jd, latitude, longitude)

        sun_trait = sun_traits.get(sun_sign, "unique")
        moon_trait = moon_traits.get(moon_sign, "complex")
        ascendant_trait = ascendant_traits.get(ascendant, "distinctive")
    

        personal_message = (
        #f"You're a {sun_sign} with a {moon_sign} moon and {ascendant} ascendant — "
        f"you're {sun_trait} with {moon_trait}, "
        f"and you present yourself with {ascendant_trait}. "
        f"This makes you a truly fascinating individual!"
    )

        return sun_sign, moon_sign, ascendant, personal_message

# Define traits for each sign
sun_traits = {
    "Aries": "energetic and pioneering",
    "Taurus": "steady and reliable",
    "Gemini": "versatile and communicative",
    "Cancer": "caring and intuitive",
    "Leo": "confident and charismatic",
    "Virgo": "practical and detail-oriented",
    "Libra": "diplomatic and charming",
    "Scorpio": "intense and passionate",
    "Sagittarius": "adventurous and optimistic",
    "Capricorn": "ambitious and disciplined",
    "Aquarius": "innovative and independent",
    "Pisces": "compassionate and imaginative"
}

moon_traits = {
    "Aries": "emotional drive and assertiveness",
    "Taurus": "emotional stability and love of comfort",
    "Gemini": "emotional curiosity and adaptability",
    "Cancer": "emotional depth and nurturing nature",
    "Leo": "emotional warmth and need for recognition",
    "Virgo": "emotional need for order and analysis",
    "Libra": "emotional need for balance and harmony",
    "Scorpio": "emotional intensity and depth",
    "Sagittarius": "emotional need for freedom and exploration",
    "Capricorn": "emotional restraint and focus on goals",
    "Aquarius": "emotional independence and humanitarianism",
    "Pisces": "emotional sensitivity and empathy"
}

ascendant_traits = {
    "Aries": "a bold and direct approach",
    "Taurus": "a steady and determined presence",
    "Gemini": "a lively and curious outlook",
    "Cancer": "a nurturing and protective demeanor",
    "Leo": "a confident and dramatic style",
    "Virgo": "a meticulous and modest appearance",
    "Libra": "a graceful and balanced attitude",
    "Scorpio": "a magnetic and intense persona",
    "Sagittarius": "an optimistic and adventurous vibe",
    "Capricorn": "a serious and disciplined manner",
    "Aquarius": "an unconventional and innovative air",
    "Pisces": "a dreamy and compassionate aura"
}



#def calculate_julian_day(year, month, day, hour=0, minute=0, second=0):
    #return swe.julday(year, month, day, hour + minute/60.0 + second/3600.0)

def calculate_planet_positions(jd):
    positions = {}
    for planet, index in planet_indices.items():
        try:
            flag = swe.FLG_SWIEPH | swe.FLG_SPEED
            result = swe.calc_ut(jd, index, flag)
            if result and len(result) >= 6:
                lon, lat, dist, lon_speed, lat_speed, dist_speed = result[:6]
                positions[planet] = {
                    'longitude': lon,
                    'latitude': lat,
                    'distance': dist,
                    'longitude_speed': lon_speed,
                    'sign': get_zodiac_sign(lon)
                }
            else:
                logging.warning(f"Unexpected result for planet {planet}: {result}")
        except swe.Error as e:
            logging.error(f"Swiss Ephemeris error for planet {planet}: {str(e)}")
    return positions

def calculate_houses(jd, lat, lon):
    houses = {}
    try:
        cusps, ascmc = swe.houses(jd, lat, lon, b'P')
        for i, cusp in enumerate(cusps):
            houses[f'House_{i+1}'] = {
                'cusp': cusp,
                'sign': get_zodiac_sign(cusp)
            }
        houses['Ascendant'] = ascmc[0]
        houses['Midheaven'] = ascmc[1]
    except swe.Error as e:
        logging.error(f"Error calculating houses: {str(e)}")
    return houses

#def get_zodiac_sign(longitude):
    #signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
             #"Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    #longitude = longitude % 360  # Ensure longitude is 0-360
    #sign_index = int(longitude / 30)
    #return signs[sign_index]

def calculate_aspects(planet_positions):
    aspects = []
    aspect_types = {
        0: ("Conjunction", 10),
        60: ("Sextile", 6),
        90: ("Square", 10),
        120: ("Trine", 10),
        180: ("Opposition", 10)
    }

    planets = list(planet_positions.keys())
    for i in range(len(planets)):
        for j in range(i + 1, len(planets)):
            planet1 = planets[i]
            planet2 = planets[j]
            angle = abs(planet_positions[planet1]['longitude'] - planet_positions[planet2]['longitude'])
            angle = min(angle, 360 - angle)  # Consider the shorter arc

            for aspect_angle, (aspect_name, orb) in aspect_types.items():
                if abs(angle - aspect_angle) <= orb:
                    aspects.append({
                        "planet1": planet1,
                        "planet2": planet2,
                        "aspect": aspect_name,
                        "angle": round(angle, 2),
                        "orb": round(abs(angle - aspect_angle), 2)
                    })
                    break
    return aspects

def generate_daily_prediction(birth_jd, current_jd, lat, lon):
    try:
        birth_positions = calculate_planet_positions(birth_jd)
        current_positions = calculate_planet_positions(current_jd)
        aspects = calculate_aspects({**birth_positions, **current_positions})

        prediction = {
            "date": datetime.now().strftime("%Y-%m-%d"),
            'general_mood': "Your day looks promising with potential for growth.",
            'love': "Communication in relationships is highlighted today.",
            'career': "You may encounter new opportunities for advancement.",
            'health': "Pay attention to your physical well-being today."
        }

        # Modify predictions based on aspects
        for aspect in aspects:
            if aspect['planet1'] == 'Sun' and aspect['planet2'] == 'Moon':
                prediction['general_mood'] += f" Your emotions and will are in {aspect['aspect'].lower()}."
            elif (aspect['planet1'] == 'Venus' and aspect['planet2'] == 'Mars') or \
                 (aspect['planet1'] == 'Mars' and aspect['planet2'] == 'Venus'):
                prediction['love'] += f" Passion and romance are {aspect['aspect'].lower()}."
            elif aspect['planet1'] == 'Jupiter' and aspect['planet2'] == 'Saturn':
                prediction['career'] += f" Balance optimism with practicality in your work ({aspect['aspect'].lower()})."

        return prediction
    except Exception as e:
        logging.error(f"Error in generate_daily_prediction: {str(e)}")
        return {"error": "Failed to generate daily prediction"}

def generate_weekly_prediction(birth_jd, lat, lon):
    try:
        predictions = []
        current_date = datetime.utcnow()
        for i in range(7):
            date = current_date + timedelta(days=i)
            current_jd = swe.julday(date.year, date.month, date.day)
            daily_prediction = generate_daily_prediction(birth_jd, current_jd, lat, lon)
            predictions.append(daily_prediction)
        return predictions
    except Exception as e:
        logging.error(f"Error in generate_weekly_prediction: {str(e)}")
        return {"error": "Failed to generate weekly prediction"}

def generate_monthly_prediction(birth_jd, lat, lon):
    try:
        predictions = []
        current_date = datetime.utcnow()
        for i in range(30):
            date = current_date + timedelta(days=i)
            current_jd = swe.julday(date.year, date.month, date.day)
            daily_prediction = generate_daily_prediction(birth_jd, current_jd, lat, lon)
            predictions.append(daily_prediction)
        return predictions
    except Exception as e:
        logging.error(f"Error in generate_monthly_prediction: {str(e)}")
        return {"error": "Failed to generate monthly prediction"}

def calculate_compatibility(user1_jd, user2_jd):
    try:
        user1_positions = calculate_planet_positions(user1_jd)
        user2_positions = calculate_planet_positions(user2_jd)
        aspects = calculate_aspects({**user1_positions, **user2_positions})

        score = len(aspects) * 5  # Simple scoring based on number of aspects
        score = min(score, 100)  # Ensure score doesn't exceed 100

        return {
            'score': score,
            'aspects': aspects
        }
    except Exception as e:
        logging.error(f"Error calculating compatibility: {str(e)}")
        return {"error": "Failed to calculate compatibility"}

def generate_personalized_rituals(birth_jd, lat, lon):
    try:
        # Placeholder implementation
        rituals = [
            "Meditate for 10 minutes each morning",
            "Write in a gratitude journal before bed",
            "Practice deep breathing exercises during your lunch break"
        ]
        return rituals
    except Exception as e:
        logging.error(f"Error generating personalized rituals: {str(e)}")
        return {"error": "Failed to generate personalized rituals"}

def generate_relationship_forecast(user1_jd, user2_jd):
    try:
        # Placeholder implementation
        forecast = {
            'short_term': "Your communication will improve in the coming weeks.",
            'medium_term': "Expect some challenges, but they will strengthen your bond.",
            'long_term': "Your relationship has potential for long-term growth and stability."
        }
        return forecast
    except Exception as e:
        logging.error(f"Error generating relationship forecast: {str(e)}")
        return {"error": "Failed to generate relationship forecast"}

def error_response(message, status_code):
    return jsonify({"error": message}), status_code

def configure_logging(app):
    if not app.debug:
        if not os.path.exists('logs'):
            os.mkdir('logs')
        file_handler = RotatingFileHandler('logs/astrogenie.log', maxBytes=10240, backupCount=10)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('AstroGenie startup')
