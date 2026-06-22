import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        page = await b.new_page()
        # Login
        await page.goto('http://localhost:3000/login')
        await page.fill("input[type='text']", 'superadmin')
        await page.fill("input[type='password']", 'Testing@123!')
        await page.click("button[type='submit']")
        
        await page.wait_for_selector("text=New Admission", timeout=60000)
        
        # Click new admission
        try:
            await page.click("text=New Admission", timeout=5000)
            print('Click successful')
            await page.wait_for_timeout(2000)
            print('URL after click:', page.url)
        except Exception as e:
            print('Click failed:', str(e))
        await b.close()

asyncio.run(test())
