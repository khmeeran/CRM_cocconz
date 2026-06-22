import asyncio
from playwright.async_api import async_playwright

async def verify_rbac():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        page = await b.new_page()
        
        # Login as teacher
        await page.goto('http://localhost:3000/login')
        await page.fill("input[type='text']", 'teacher')
        await page.fill("input[type='password']", 'Testing@123!')
        await page.click("button[type='submit']")
        await page.wait_for_url('**/admin')
        
        # Try to access users page
        print('Attempting to access /admin/users as Teacher...')
        await page.goto('http://localhost:3000/admin/users')
        await page.wait_for_timeout(2000)
        
        print('URL after attempting to access /admin/users:', page.url)
        if page.url == 'http://localhost:3000/admin' or page.url == 'http://localhost:3000/admin/':
            print('VERIFIED: Unauthorized access blocked and redirected to dashboard.')
        else:
            print('FAILED: Did not redirect.')
            
        await b.close()

if __name__ == '__main__':
    asyncio.run(verify_rbac())
