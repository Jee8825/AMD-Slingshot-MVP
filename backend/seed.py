import asyncio
import random
from faker import Faker
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

from app.database import AsyncSessionLocal, engine, Base
from app.models.user import User
from app.models.grievance import Grievance
from app.models.project import Project
from app.models.audit_ledger import AuditLedger

# We do not use hash_password here if we import it from app.utils.hashing, 
# because it requires the context. Let's try to import it.
from app.utils.hashing import hash_password, generate_ledger_hash

fake = Faker('en_IN')

async def seed_db():
    print("Connecting to DB and checking if empty...")
    
    # Optional: We will clear the database by dropping and creating all tables.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        print("Database cleared and recreated. Starting seeding...")
        
        # 1. Create 5 fake Official users
        print("Creating 5 Officials...")
        officials = []
        for _ in range(5):
            official = User(
                full_name=fake.name(),
                phone=fake.phone_number()[:15],
                email=fake.email(),
                password_hash=hash_password('Mypassword@123'),
                role="OFFICIAL",
                village=fake.city(),
                district=fake.state()
            )
            session.add(official)
            officials.append(official)
            
        await session.commit()
        for off in officials:
            await session.refresh(off)
            
        # 2. Create 20 fake Citizen users
        print("Creating 20 Citizens...")
        citizens = []
        for _ in range(20):
            citizen = User(
                full_name=fake.name(),
                phone=fake.phone_number()[:15],
                email=fake.email(),
                password_hash=hash_password('Mypassword@123'),
                role="CITIZEN",
                village=fake.city(),
                district=fake.state()
            )
            session.add(citizen)
            citizens.append(citizen)
            
        await session.commit()
        for cit in citizens:
            await session.refresh(cit)
            
        # 3. Create 30 pending grievances 
        # Lat/Lng center in Bangalore approx: 12.9716, 77.5946
        print("Creating 30 ending Grievances...")
        categories = ["Water", "Roads", "Electricity", "Sanitation", "Other"]
        statuses = ["SUBMITTED", "ACKNOWLEDGED"]
        for _ in range(30):
            citizen = random.choice(citizens)
            assigned_off = random.choice([None, random.choice(officials)])
            grievance = Grievance(
                citizen_id=citizen.id,
                assigned_to=assigned_off.id if assigned_off else None,
                title=fake.catch_phrase(),
                description=fake.text(),
                category=random.choice(categories),
                status=random.choice(statuses),
                latitude=12.9716 + random.uniform(-0.05, 0.05),
                longitude=77.5946 + random.uniform(-0.05, 0.05),
                address=fake.address()
            )
            session.add(grievance)
            
        await session.commit()
        
        # 4. Create 5 completed projects with audit_ledger entries
        print("Creating 5 completed Projects and Audit Ledger entries...")
        prev_hash = "0" * 64
        for _ in range(5):
            official = random.choice(officials)
            budget = float(random.randint(100000, 1000000))
            project = Project(
                name=fake.company() + " Infrastructure",
                description=fake.text(),
                allocated_budget=budget,
                disbursed_amount=budget,
                status="Completed",
                created_by=official.id
            )
            session.add(project)
            await session.commit()
            await session.refresh(project)
            
            # Create corresponding audit ledger entry
            transaction_data = {
                "project_id": str(project.id),
                "disbursed_amount": project.disbursed_amount,
                "disbursed_by": str(project.created_by),
                "timestamp": project.updated_at.isoformat() if project.updated_at else ""
            }
            
            current_hash = generate_ledger_hash(transaction_data, prev_hash)
            
            ledger_entry = AuditLedger(
                scheme_name=project.name,
                amount=project.disbursed_amount,
                beneficiary=fake.company(),
                disbursed_by=project.created_by,
                description=f"Final disbursement for {project.name}",
                prev_hash=prev_hash,
                current_hash=current_hash
            )
            session.add(ledger_entry)
            await session.commit()
            await session.refresh(ledger_entry)
            
            prev_hash = current_hash
            
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_db())
