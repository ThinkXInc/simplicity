// 外部スクリプトが実行時に供給するグローバル(バンドル外)。
// ここに載っていないグローバルへの依存を src に追加してはならない。
declare const Cookies: {
    get(name: string): string | undefined;
    set(name: string, value: string, options?: object): void;
    remove(name: string, options?: object): void;
};
declare const google: any; // Google Maps JS API(詳細型は将来 @types/google.maps 導入時に置換)
