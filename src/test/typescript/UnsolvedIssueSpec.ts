///<reference path='libs/DefinitelyTyped/jasmine/jasmine.d.ts' />

///<reference path='../../main/typescript/Builder.ts' />
///<reference path='../../main/typescript/builder/TextBuilder.ts' />
///<reference path='../../main/typescript/builder/HtmlBuilder.ts' />

"use strict";

describe("俺たちは腐ったみかんじゃねえ！", ()=> {
    describe("listを食わせるぜ！", ()=> {
        xit("listの中身の途中に改行を含んでいる", ()=> {
            var files:any = {
                "./ch01.re": "= title\n//list[hoge][きゃぷしょん]{\nalert('hello');\n\n//}\n"

                //死なないパターン
                //"./ch01.re": "= title\n//list[hoge][きゃぷしょん]{\nalert('hello');\n//}\n"
            };
            var result:any = {
            };
            var book = ReVIEW.start((review)=> {
                review.initConfig({
                    read: function (path) {
                        return files[path];
                    },
                    write: function (path, content) {
                        result[path] = content;
                    },

                    compileSuccess: ()=> {
                    },
                    compileFailed: ()=> {
                    },

                    builders: [new ReVIEW.Build.TextBuilder()],

                    book: {
                        preface: [
                        ],
                        chapters: [
                            "ch01.re"
                        ],
                        afterword: [
                        ]
                    }
                });
            });
            var expected = "■H1■第1章　title\n\n◆→開始:リスト←◆\nリスト1.1　きゃぷしょん\nalert('hello');\n\n◆→終了:リスト←◆\n\n";

            //死なないパターンのexpected
            //var expected = "■H1■第1章　title\n\n◆→開始:リスト←◆\nリスト1.1　きゃぷしょん\nalert('hello');\n◆→終了:リスト←◆\n\n";

            expect(book.parts[1].chapters[0].process.result).toBe(expected);
        });
    });

});
