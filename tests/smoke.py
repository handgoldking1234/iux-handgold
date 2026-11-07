"""스모크 테스트: 합성 손바닥 사진으로 분석·풀이·음성 버튼·고치기 칩이 오류 없이 도는지 확인.
실행: pip install playwright && playwright install chromium && python tests/smoke.py
(크롬 경로가 다르면 CHROME 환경변수로 지정)"""
import asyncio, os, pathlib
from playwright.async_api import async_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
async def main():
    async with async_playwright() as p:
        kw = {'executable_path': os.environ['CHROME']} if os.environ.get('CHROME') else {}
        b = await p.chromium.launch(**kw)
        pg = await b.new_page(viewport={'width': 420, 'height': 900})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto((ROOT / 'index.html').as_uri())
        for img in ['palm.png', 'palm2.png']:
            await pg.evaluate("go('photo')")
            await pg.set_input_files('#filePick', str(ROOT / 'tests/fixtures' / img))
            await pg.wait_for_timeout(800)
            await pg.evaluate("runAnalysis()")
            await pg.wait_for_timeout(2000)
            r = await pg.evaluate("({type:state.reading.type.title, mount:state.reading.mount.top, steps:state.reading.steps.length})")
            print(img, r)
            await pg.evaluate("document.querySelector('.fix').open=true")
            await pg.click('.fix .opt[data-mount="월구"]')
            await pg.click('#speakBtn'); await pg.wait_for_timeout(200); await pg.click('#speakBtn')
            await pg.screenshot(path=str(ROOT / f'tests/out_{img}'), full_page=True)
            await pg.evaluate("resetPhoto()")
        # v2: 양손 + 사주 + 질문
        await pg.evaluate("go('photo')")
        await pg.set_input_files('#filePick', str(ROOT / 'tests/fixtures/palm.png')); await pg.wait_for_timeout(600)
        await pg.evaluate("runAnalysis()"); await pg.wait_for_timeout(2000)
        await pg.evaluate("switchHand('왼손')")
        await pg.set_input_files('#filePick', str(ROOT / 'tests/fixtures/palm2.png')); await pg.wait_for_timeout(600)
        await pg.evaluate("runAnalysis()"); await pg.wait_for_timeout(2000)
        await pg.evaluate("toggleLineView()")
        await pg.evaluate("state.sajuIn={cal:'양력',leap:false,date:'2000-01-01',time:'',gender:'남',correct:true}; renderCombo()")
        sj = await pg.evaluate("currentSaju().P.map(([n,p])=>STEM[p.s]+BR[p.b]).join(' ')")
        print('saju', sj); assert sj == '己卯 丙子 戊午', sj  # 2000-01-01 = 戊午일(기준값)
        for q in ['결혼은 언제쯤?', '이직해도 될까요?', '언제 죽어요?']:
            print(q, '→', (await pg.evaluate(f"answer({q!r})"))[:80])
        # v4: 격국·신살, 관상, 3원 통합
        g = await pg.evaluate("gyeokOf(currentSaju())"); print('격국', g); assert g == '정재', g
        await pg.evaluate("go('face')")
        await pg.set_input_files('#fFile', str(ROOT / 'tests/fixtures/face.png')); await pg.wait_for_timeout(600)
        await pg.evaluate("faceAnalyze()")
        print('관상', await pg.evaluate("state.face.feat.shape"))
        srcs = await pg.evaluate("(()=>{const R=fullReport(); return [R.saju,!!R.hand,R.face]})()")
        print('통합', srcs); assert srcs == [True, True, True], srcs
        await pg.evaluate("stopSpeak()")
        print('errors', errs)
        await b.close()
        assert not errs, errs
asyncio.run(main())
