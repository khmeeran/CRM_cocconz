import asyncio
from playwright.async_api import async_playwright
import os

async def capture_login():
    if not os.path.exists("screenshots_login"):
        os.makedirs("screenshots_login")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print("Navigating to login page...")
        await page.goto("http://localhost:3000/login", wait_until="networkidle")
        
        await page.fill("input[type='password']", "Testing123")
        
        print("Capturing hidden password...")
        await page.screenshot(path="screenshots_login/hidden.png", full_page=True)
        
        print("Clicking show password toggle...")
        # The button is the only button in the password div. Let's find it by type="button"
        await page.click("button[type='button']")
        
        print("Capturing visible password...")
        await page.screenshot(path="screenshots_login/visible.png", full_page=True)

        await browser.close()
        print("Screenshots captured successfully.")

if __name__ == "__main__":
    asyncio.run(capture_login())
