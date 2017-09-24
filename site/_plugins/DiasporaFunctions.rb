require 'json'
module Jekyll
	module DiasporaFunctions
		def relative_path_to_root(input)
			url = @context.registers[:page]['url'];
			count = url.count("/") - 1;
			count = [count, 0].max;
			ret = ("../" * count);
			ret = (ret || "") + (input || "");
			ret;
		end
		def to_tree(pages, basetree)
			site = @context.registers[:site];
			tree = {};
			rootPages = [];
			for page in site.pages
				if page.url.start_with?(basetree)
					stripedUrl = page.url.sub(basetree, '').sub('.html', '');
					title = page['title'];
					segments = stripedUrl.split('.');
					if segments.length > 1 && segments.last == 'list'
						segments.pop(1)
					end
					segsCount = segments.length;
					if segsCount > 0
						subtree = tree;
						segments.each do |segment|
							segmentUp = segment.sub(/\S/, &:upcase)
							if !subtree.key?('children')
								subtree['children'] = {};
							end
							if !subtree['children'].key?(segmentUp)
								subtree['children'][segmentUp] = {}
							end
							subtree = subtree['children'][segmentUp];
							if segment == segments.last
								subtree['page'] = page;
							end
						end
					else
						tree['page'] = page;
					end
				end
			end
			tree;
		end
	end
end

Liquid::Template.register_filter(Jekyll::DiasporaFunctions)