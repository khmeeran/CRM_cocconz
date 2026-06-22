import asyncio
from playwright.async_api import async_playwright
import os

async def test_rbac():
    if not os.path.exists("screenshots_rbac"):
        os.makedirs("screenshots_rbac")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        # Test roles
        roles = [
            ("superadmin", "Testing@123!", "super-admin"),
            ("branchadmin", "Testing@123!", "branch-admin"),
            ("accountant", "Testing@123!", "accountant"),
            ("teacher", "Testing@123!", "teacher")
        ]

        page = await browser.new_page()

        for username, password, expected_route in roles:
            print(f"\\n--- Testing {username} ---")
            await page.goto("http://localhost:3000/login", wait_until="networkidle")
            
            await page.fill("input[type='text']", username)
            await page.fill("input[type='password']", password)
            await page.click("button[type='submit']")
            
            await page.wait_for_url(f"**/{expected_route}*", timeout=60000)
            await page.wait_for_timeout(3000)
            
            print(f"VERIFIED LOGIN REDIRECT: {username} -> {page.url}")
            await page.screenshot(path=f"screenshots_rbac/01_Dashboard_{username}.png", full_page=True)
            
            # Test unauthorized access
            if username == "teacher":
                unauth_url = "http://localhost:3000/super-admin/users"
                print(f"Attempting unauthorized access: {unauth_url}")
                await page.goto(unauth_url)
                await page.wait_for_timeout(2000)
                print(f"URL after unauthorized access attempt: {page.url}")
                if f"/{expected_route}" in page.url or "/login" in page.url:
                    print("VERIFIED: Unauthorized access blocked.")
                else:
                    print("FAILED: Unauthorized access allowed!")
            
            # Log out
            await page.click("button:has-text('Logout')")
            await page.wait_for_url("**/login")
            
        await browser.close()
        print("Screenshots captured successfully.")

if __name__ == "__main__":
    asyncio.run(test_rbac())
