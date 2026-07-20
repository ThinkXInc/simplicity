/**
 * @fileoverview helpers/theme.js
 * テーマ切替ヘルパ。
 *
 * simplicity のテーマは「スタイルシート1枚」である(D-44)。
 * styles/themes/simplicity_<name>.css(トークン定義)から dist/simplicity_<name>.css が
 * 同名でビルドされ、消費側はそのうち1枚を link する。テーマ切替 = link の差し替えであり、
 * 本ヘルパはその差し替えを行うだけである。
 * 永続化(ユーザーのテーマ選択の保存)は消費側アプリの責務であり、ここでは行わない。
 *
 * usage:
 * <code>
 *   Simplicity.setTheme('dark');    // simplicity_dark.css へ差し替え
 *   Simplicity.getTheme();          // -> 'dark'
 *   Simplicity.setTheme('default'); // 既定へ戻す
 * </code>
 */
class Simplicity {

    /**
     * 現在 link されている simplicity テーマ css を simplicity_<name>.css へ差し替える。
     * FOUC を避けるため、新しい link の読み込み完了後に旧 link を除去する。
     * @param {string} name - テーマ名(dist/simplicity_<name>.css が存在すること)
     */
    static setTheme(name) {
        const link = Simplicity._themeLink();
        if (!link) {
            console.error('[Simplicity.setTheme] simplicity_<theme>.css の link が見つからない');
            return;
        }
        const currentHref = link.getAttribute('href');
        const nextHref = currentHref.replace(/simplicity_[A-Za-z0-9_-]+\.css/, `simplicity_${name}.css`);
        if (nextHref === currentHref) {
            debuglog(`[Simplicity.setTheme] already ${name}`);
            return;
        }
        const next = document.createElement('link');
        next.rel = 'stylesheet';
        next.href = nextHref;
        next.addEventListener('load', () => link.remove());
        next.addEventListener('error', () => {
            console.error(`[Simplicity.setTheme] failed to load ${nextHref}`);
            next.remove();
        });
        link.after(next);
    }

    /**
     * 現在のテーマ名を返す。
     * @returns {string|null} テーマ名(link が見つからなければ null)
     */
    static getTheme() {
        const link = Simplicity._themeLink();
        if (!link) return null;
        const matched = link.getAttribute('href').match(/simplicity_([A-Za-z0-9_-]+)\.css/);
        return matched ? matched[1] : null;
    }

    static _themeLink() {
        // 切替中は旧 link(除去待ち)と新 link が同時に存在しうるため、
        // 「最後にマッチした link」= 最新のテーマを現在値とする
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        let found = null;
        for (const link of links) {
            const href = link.getAttribute('href');
            if (href && /simplicity_[A-Za-z0-9_-]+\.css/.test(href)) found = link;
        }
        return found;
    }
}
