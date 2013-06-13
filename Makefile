
build: components index.js stars.css template.js
	@component build --dev

template.js: template.jade
	echo "var jade = require('jade-runtime');" > $@
	echo "module.exports = " >> $@
	jade -Dc < $^ >> $@
	echo ";" >> $@

stars.css: stars_src.css rework.js images/star_gray.svg images/star.svg
	node rework.js $< > $@

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: clean
