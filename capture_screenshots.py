import asyncio
from playwright.async_api import async_playwright
import os

async def capture_screenshots():
    if not os.path.exists("screenshots"):
        os.makedirs("screenshots")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        # Test roles
        roles = [
            ("superadmin", "Testing@123!"),
            ("branchadmin", "Testing@123!"),
            ("accountant", "Testing@123!"),
            ("teacher", "Testing@123!")
        ]

        page = await browser.new_page()

        # Login page screenshot
        print("Navigating to login page...")
        await page.goto("http://localhost:3000/login", wait_until="networkidle")
        await page.screenshot(path="screenshots/01_Login_Page.png", full_page=True)

        for username, password in roles:
            print(f"Testing login for {username}...")
            
            # Go to login
            await page.goto("http://localhost:3000/login", wait_until="networkidle")
            
            # Fill credentials
            await page.fill("input[type='text']", username)
            await page.fill("input[type='password']", password)
            await page.click("button[type='submit']")
            
            # Wait for dashboard to load
            await page.wait_for_url("**/admin**", timeout=60000)
            await page.wait_for_timeout(5000) # Let animations settle
            
            print(f"Taking screenshot for {username} dashboard...")
            await page.screenshot(path=f"screenshots/02_Dashboard_{username}.png", full_page=True)
            
            # Log out
            await page.goto("http://localhost:3000/login")
            
        await browser.close()
        print("Screenshots captured successfully.")

if __name__ == "__main__":
    asyncio.run(capture_screenshots())
