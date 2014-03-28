default: data
	@mkdir -p css font scss less
	@cd $< && git pull
	@cp -f $</css/* ./css
	@cp -f $</font/* ./font
	@cp -f $</scss/* ./scss
	@cp -f $</less/* ./less
	@du -bh css* font* scss* less*

data:
	@git clone https://github.com/FortAwesome/Font-Awesome.git $@

.PHONY: default
