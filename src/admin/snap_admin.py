from playwright.sync_api import sync_playwright
import os

out = r"C:\Users\RBBUMA~1.JR\AppData\Local\Temp\claude\C--Users-r-b-bumanglag-jr-Documents-GenWizard-Innovations\76795fdd-cf11-45d9-8e17-939e7674a215\scratchpad"

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width": 1440, "height": 900})

    # PIN gate
    pg.goto("http://localhost:5174/admin")
    pg.wait_for_load_state("networkidle")
    pg.wait_for_timeout(600)
    pg.screenshot(path=os.path.join(out, "admin_pin.png"), full_page=False)

    # unlock with default PIN 1234
    pg.fill("input[type='password']", "1234")
    pg.wait_for_timeout(200)
    pg.click("button:has-text('Unlock')")
    pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(out, "admin_events.png"), full_page=False)

    # navigate to Settings
    pg.click("button:has-text('Settings')")
    pg.wait_for_timeout(300)
    pg.screenshot(path=os.path.join(out, "admin_settings.png"), full_page=False)

    # navigate to AI Generate
    pg.click("button:has-text('AI Generate')")
    pg.wait_for_timeout(300)
    pg.screenshot(path=os.path.join(out, "admin_generate.png"), full_page=False)

    b.close()
    print("done")
