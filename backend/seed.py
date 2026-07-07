from datetime import datetime, timedelta
from app.database import SessionLocal, create_tables
from app.models import User, Tour, Booking
from app.core.security import get_password_hash



def seed_database():
    create_tables()
    db = SessionLocal()

    if db.query(User).count() > 0:
        print("دیتابیس قبلاً سید شده!")
        db.close()
        return

    admin = User(
        username="admin",
        email="admin@travel.com",
        password_hash=get_password_hash("admin123"),
        full_name="System Admin",
        is_admin=True,
    )
    db.add(admin)

    test_user = User(
        username="testuser",
        email="test@travel.com",
        password_hash=get_password_hash("test123"),
        full_name="Test User",
        is_admin=False,
    )
    db.add(test_user)

    users = [
        User(
            username="ali_reza",
            email="ali@email.com",
            password_hash=get_password_hash("123456"),
            full_name="Ali Rezaei",
        ),
        User(
            username="sara_m",
            email="sara@email.com",
            password_hash=get_password_hash("123456"),
            full_name="Sara Mohammadi",
        ),
        User(
            username="mohsen_k",
            email="mohsen@email.com",
            password_hash=get_password_hash("123456"),
            full_name="Mohsen Karimi",
        ),
    ]
    for user in users:
        db.add(user)
    db.flush()

    tours = [
        Tour(
            name="Istanbul Tour",
            destination="Istanbul, Turkey",
            description="5-day Istanbul tour visiting historical mosques and the Grand Bazaar",
            start_date=datetime(2026, 7, 12),
            end_date=datetime(2026, 7, 17),
            price=25000000,
            capacity=20,
            available_seats=15,
            is_active=True,
        ),
        Tour(
            name="Antalya Tour",
            destination="Antalya, Turkey",
            description="7-day coastal Antalya tour with a 5-star hotel",
            start_date=datetime(2026, 7, 24),
            end_date=datetime(2026, 7, 31),
            price=18000000,
            capacity=15,
            available_seats=8,
            is_active=True,
        ),
        Tour(
            name="Dubai Tour",
            destination="Dubai, UAE",
            description="4-day luxury Dubai tour visiting Burj Khalifa and shopping",
            start_date=datetime(2026, 7, 6),
            end_date=datetime(2026, 7, 10),
            price=45000000,
            capacity=12,
            available_seats=3,
            is_active=True,
        ),
        Tour(
            name="Kish Island Tour",
            destination="Kish Island, Iran",
            description="3-day recreational Kish tour with boating",
            start_date=datetime(2026, 7, 30),
            end_date=datetime(2026, 8, 2),
            price=8000000,
            capacity=30,
            available_seats=25,
            is_active=True,
        ),
        Tour(
        name="Paris City Tour",
        destination="Paris, France",
        description="4-day Paris tour visiting Eiffel Tower, Louvre Museum, and Seine River cruise. Includes hotel and breakfast.",
        start_date=datetime(2026, 8, 5),
        end_date=datetime(2026, 8, 9),
        price=42000000,
        capacity=15,
        available_seats=12,
        is_active=True,
    ),
    Tour(
        name="London Heritage Tour",
        destination="London, UK",
        description="3-day London tour visiting Big Ben, Tower of London, Buckingham Palace, and British Museum.",
        start_date=datetime(2026, 8, 10),
        end_date=datetime(2026, 8, 13),
        price=38000000,
        capacity=12,
        available_seats=10,
        is_active=True,
    ),
    Tour(
        name="Rome Adventure",
        destination="Rome, Italy",
        description="5-day Rome tour exploring Colosseum, Vatican City, Trevi Fountain, and authentic Italian cuisine.",
        start_date=datetime(2026, 8, 15),
        end_date=datetime(2026, 8, 20),
        price=45000000,
        capacity=10,
        available_seats=8,
        is_active=True,
    ),
    Tour(
        name="Barcelona Beach Tour",
        destination="Barcelona, Spain",
        description="4-day Barcelona beach tour exploring Mediterranean coastline, Sagrada Familia, and Gothic Quarter.",
        start_date=datetime(2026, 8, 20),
        end_date=datetime(2026, 8, 24),
        price=32000000,
        capacity=20,
        available_seats=18,
        is_active=True,
    ),
    Tour(
        name="Amsterdam Canal Tour",
        destination="Amsterdam, Netherlands",
        description="3-day Amsterdam tour with canal cruises, Van Gogh Museum, Anne Frank House, and bike tours.",
        start_date=datetime(2026, 9, 1),
        end_date=datetime(2026, 9, 4),
        price=28000000,
        capacity=14,
        available_seats=14,
        is_active=True,
    ),
    Tour(
        name="Prague Castle Tour",
        destination="Prague, Czech Republic",
        description="4-day Prague tour visiting Prague Castle, Charles Bridge, Old Town Square, and local beer tasting.",
        start_date=datetime(2026, 9, 5),
        end_date=datetime(2026, 9, 9),
        price=22000000,
        capacity=18,
        available_seats=18,
        is_active=True,
    ),
    Tour(
        name="Vienna Classical Tour",
        destination="Vienna, Austria",
        description="3-day Vienna tour with Schönbrunn Palace, St. Stephen's Cathedral, and classical music concerts.",
        start_date=datetime(2026, 9, 10),
        end_date=datetime(2026, 9, 13),
        price=26000000,
        capacity=12,
        available_seats=11,
        is_active=True,
    ),
    Tour(
        name="Budapest Danube Tour",
        destination="Budapest, Hungary",
        description="3-day Budapest tour with Danube River cruise, Buda Castle, thermal baths, and Hungarian cuisine.",
        start_date=datetime(2026, 9, 15),
        end_date=datetime(2026, 9, 18),
        price=19000000,
        capacity=16,
        available_seats=16,
        is_active=True,
    ),
    Tour(
        name="Athens Acropolis Tour",
        destination="Athens, Greece",
        description="4-day Athens tour visiting Acropolis, Parthenon, Ancient Agora, and Greek island day trip.",
        start_date=datetime(2026, 9, 20),
        end_date=datetime(2026, 9, 24),
        price=35000000,
        capacity=14,
        available_seats=14,
        is_active=True,
    ),
    Tour(
        name="Lisbon Coastal Tour",
        destination="Lisbon, Portugal",
        description="4-day Lisbon tour exploring Belém Tower, Jerónimos Monastery, and beautiful coastal views.",
        start_date=datetime(2026, 9, 25),
        end_date=datetime(2026, 9, 29),
        price=24000000,
        capacity=15,
        available_seats=15,
        is_active=True,
    ),
    Tour(
        name="Istanbul Bosphorus Tour",
        destination="Istanbul, Turkey",
        description="5-day Istanbul tour with Bosphorus cruise, Hagia Sophia, Blue Mosque, and Grand Bazaar.",
        start_date=datetime(2026, 7, 20),
        end_date=datetime(2026, 7, 25),
        price=27000000,
        capacity=20,
        available_seats=20,
        is_active=True,
    ),
    Tour(
        name="Cappadocia Balloon Tour",
        destination="Cappadocia, Turkey",
        description="3-day Cappadocia tour with hot air balloon ride, fairy chimneys, and underground cities.",
        start_date=datetime(2026, 7, 28),
        end_date=datetime(2026, 7, 31),
        price=32000000,
        capacity=10,
        available_seats=6,
        is_active=True,
    ),
    Tour(
        name="Dubai Desert Safari",
        destination="Dubai, UAE",
        description="3-day Dubai tour with desert safari, Burj Khalifa, Dubai Mall, and luxury shopping experience.",
        start_date=datetime(2026, 7, 15),
        end_date=datetime(2026, 7, 18),
        price=50000000,
        capacity=12,
        available_seats=12,
        is_active=True,
    ),
    Tour(
        name="Singapore City Tour",
        destination="Singapore",
        description="4-day Singapore tour visiting Gardens by the Bay, Marina Bay Sands, Sentosa Island, and local hawker food.",
        start_date=datetime(2026, 8, 1),
        end_date=datetime(2026, 8, 5),
        price=48000000,
        capacity=10,
        available_seats=8,
        is_active=True,
    ),
    Tour(
        name="Bangkok Temple Tour",
        destination="Bangkok, Thailand",
        description="4-day Bangkok tour with Grand Palace, Wat Arun, floating markets, and Thai street food experience.",
        start_date=datetime(2026, 8, 8),
        end_date=datetime(2026, 8, 12),
        price=15000000,
        capacity=20,
        available_seats=20,
        is_active=True,
    ),
    Tour(
        name="Tokyo Cultural Tour",
        destination="Tokyo, Japan",
        description="6-day Tokyo tour visiting Senso-ji Temple, Shibuya Crossing, Mount Fuji day trip, and sushi-making class.",
        start_date=datetime(2026, 9, 1),
        end_date=datetime(2026, 9, 7),
        price=60000000,
        capacity=8,
        available_seats=5,
        is_active=True,
    ),
    Tour(
        name="Seoul K-Pop Tour",
        destination="Seoul, South Korea",
        description="5-day Seoul tour with K-Pop experience, Gyeongbokgung Palace, Namsan Tower, and Korean BBQ cooking.",
        start_date=datetime(2026, 9, 10),
        end_date=datetime(2026, 9, 15),
        price=38000000,
        capacity=12,
        available_seats=12,
        is_active=True,
    ),
    Tour(
        name="Bali Paradise Tour",
        destination="Bali, Indonesia",
        description="6-day Bali tour with Ubud rice terraces, Tanah Lot Temple, snorkeling, and beach relaxation.",
        start_date=datetime(2026, 9, 20),
        end_date=datetime(2026, 9, 26),
        price=25000000,
        capacity=16,
        available_seats=14,
        is_active=True,
    ),
    Tour(
        name="New York City Tour",
        destination="New York, USA",
        description="5-day NYC tour visiting Statue of Liberty, Times Square, Central Park, and Broadway shows.",
        start_date=datetime(2026, 10, 1),
        end_date=datetime(2026, 10, 6),
        price=65000000,
        capacity=10,
        available_seats=7,
        is_active=True,
    ),
    Tour(
        name="Los Angeles Hollywood Tour",
        destination="Los Angeles, USA",
        description="4-day LA tour with Hollywood Walk of Fame, Universal Studios, Santa Monica Pier, and celebrity homes tour.",
        start_date=datetime(2026, 10, 10),
        end_date=datetime(2026, 10, 14),
        price=55000000,
        capacity=12,
        available_seats=12,
        is_active=True,
        )
    ]
    for tour in tours:
        db.add(tour)
    db.flush()  

    bookings = [
        Booking(
            user_id=users[0].id,
            tour_id=tours[0].id,  
            number_of_tickets=2,
            total_price=tours[0].price * 2,
            status="confirmed",
            payment_status="paid",
        ),
        Booking(
            user_id=users[1].id,
            tour_id=tours[1].id,  
            number_of_tickets=1,
            total_price=tours[1].price,
            status="pending",
            payment_status="unpaid",
        ),
        Booking(
            user_id=users[0].id,
            tour_id=tours[2].id, 
            number_of_tickets=3,
            total_price=tours[2].price * 3,
            status="confirmed",
            payment_status="paid",
        ),
        
    ]
    for booking in bookings:
        db.add(booking)

    db.commit()
    db.close()
    print("✅ دیتابیس با موفقیت سید شد!")


if __name__ == "__main__":
    seed_database()
