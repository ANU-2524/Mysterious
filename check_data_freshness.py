
import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.db.session import AsyncSessionLocal
from app.db.models import Signal, Alert, RiskScore
from sqlalchemy import select, desc

async def check():
    try:
        async with AsyncSessionLocal() as s:
            sig = (await s.execute(select(Signal).order_by(desc(Signal.published_at)).limit(1))).scalar_one_or_none()
            alr = (await s.execute(select(Alert).order_by(desc(Alert.triggered_at)).limit(1))).scalar_one_or_none()
            scr = (await s.execute(select(RiskScore).order_by(desc(RiskScore.computed_at)).limit(1))).scalar_one_or_none()
            
            print("--- DATA FRESHNESS STATUS ---")
            if sig:
                print(f"Latest Signal (News/SEC): {sig.published_at} from {sig.source}")
            else:
                print("Latest Signal: No data found.")
                
            if alr:
                print(f"Latest Alert: {alr.triggered_at}")
            else:
                print("Latest Alert: No alerts found.")
                
            if scr:
                print(f"Latest Risk Score Computation: {scr.computed_at}")
            else:
                print("Latest Risk Score: No computations found.")
            print("-----------------------------")
    except Exception as e:
        print(f"Error checking data status: {e}")

if __name__ == "__main__":
    asyncio.run(check())
