import asyncio
from playwright.async_api import async_playwright
import os

async def capture_live():
    if not os.path.exists("screenshots_live"):
        os.makedirs("screenshots_live")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        roles = [
            ("superadmin", "Testing@123!", "super-admin"),
            ("branchadmin", "Testing@123!", "branch-admin"),
            ("accountant", "Testing@123!", "accountant"),
            ("teacher", "Testing@123!", "teacher")
        ]

        page = await browser.new_page()

        for username, password, expected_route in roles:
            print(f"\\n--- Testing {username} on LIVE URL ---")
            await page.goto("https://crm-cocconz.vercel.app/login", wait_until="networkidle")
            
            await page.fill("input[type='text']", username)
            await page.fill("input[type='password']", password)
            await page.click("button[type='submit']")
            
            # Wait for route
            await page.wait_for_url(f"**/{expected_route}*", timeout=60000)
            await page.wait_for_timeout(5000) # Give animations/data time
            
            print(f"VERIFIED LOGIN REDIRECT: {username} -> {page.url}")
            await page.screenshot(path=f"screenshots_live/01_Live_Dashboard_{username}.png", full_page=True)
            
            # For teacher, test unauthorized access
            if username == "teacher":
                unauth_url = "https://crm-cocconz.vercel.app/super-admin/users"
                print(f"Attempting unauthorized access: {unauth_url}")
                await page.goto(unauth_url)
                await page.wait_for_timeout(3000)
                print(f"URL after unauthorized access attempt: {page.url}")
                if "super-admin" not in page.url:
                    print("VERIFIED: Unauthorized access blocked.")
                else:
                    print("FAILED: Unauthorized access allowed!")
            
            # Clear local storage for next user
            await page.evaluate("localStorage.clear()")
            await page.context.clear_cookies()
            
        await browser.close()
        print("Screenshots captured successfully.")

if __name__ == "__main__":
    asyncio.run(capture_live())
