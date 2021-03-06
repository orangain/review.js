"use strict";

import * as Test from "./testHelper";

import {isNodeJS} from "../../lib/utils/utils";

import {Builder} from "../../lib/builder/builder";
import {TextBuilder} from "../../lib/builder/textBuilder";
import {HtmlBuilder} from "../../lib/builder/htmlBuilder";

describe("Ruby版ReVIEWとの出力差確認", () => {
	"use strict";

	if (!isNodeJS()) {
		return;
	}

	let exec = require("child_process").exec;

	function convertByRubyReVIEW(fileName: string, target: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			exec(
				"review-compile --level=1 --target=" + target + " " + fileName + ".re",
				{
					cwd: "test/fixture/valid",
					env: process.env
				},
				(err: Error, stdout: NodeBuffer, stderr: NodeBuffer) => {
					if (err) {
						reject(err);
						return;
					} else {
						resolve(stdout.toString());
					}
				}
			);
		});
	}

	// PhantomJS 環境下専用のテスト
	describe("正しい構文のファイルが処理できること", () => {
		/* tslint:disable:no-require-imports */
		let fs = require("fs");
		/* tslint:enable:no-require-imports */

		let typeList: { ext: string; target: string; builder: () => Builder; }[] = [
			{
				ext: "txt",
				target: "text",
				builder: () => new TextBuilder()
			},
			{
				ext: "html",
				target: "html",
				builder: () => new HtmlBuilder()
			}
		];

		let ignoreFiles = [
			"ch01.re", // lead, emplist がまだサポートされていない
			"empty.re", // empty への対応をまだ行っていない ファイル実体は存在していない
			"block_graph.re", // graph への対応がまだ不完全なので
			"inline.re", // tti がまだサポートされていない < のエスケープとかも
			"inline_nested.re", // Ruby版はネストを許可しない
			"inline_with_newline.re", // Ruby版の処理が腐っている気がする
			"lead.re", // ブロック構文内でのParagraphの扱いがおかしいのを直していない
			"preface.re", // めんどくさいので
			"preproc.re"  // めんどくさいので
		];

		let path = "test/fixture/valid/";
		fs.readdirSync(path)
			.filter((file: string) => file.indexOf(".re") !== -1 && !ignoreFiles.some(ignore => ignore === file))
			.forEach((file: string) => {
				let baseName = file.substr(0, file.length - 3);

				typeList.forEach(typeInfo => {
					let targetFileName = path + baseName + "." + typeInfo.ext;
					it("ファイル:" + targetFileName, () => {
						let text = fs.readFileSync(path + file, "utf8");
						return Test.compile({
							basePath: process.cwd() + "/test/fixture/valid",
							read: path => Promise.resolve(text),
							builders: [typeInfo.builder()],
							book: {
								contents: [
									file
								]
							}
						})
							.then(s=> {
								let result: string = s.results[baseName + "." + typeInfo.ext];
								assert(result !== null);

								let assertResult = () => {
									let expected = fs.readFileSync(targetFileName, "utf8");
									assert(result === expected);
								};

								if (!fs.existsSync(targetFileName)) {
									// Ruby版の出力ファイルがない場合、出力処理を行う
									return convertByRubyReVIEW(baseName, typeInfo.target)
										.then(data=> {
											fs.writeFileSync(targetFileName, data);

											assertResult();
											return true;
										});
								} else {
									assertResult();
									return Promise.resolve(true);
								}
							});
					});
				});
			});
	});
});
