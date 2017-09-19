module Jekyll
  module RelativePathToRoot
    def relative_path_to_root(input)
		url = @context.registers[:page]['url'];
		count = url.count("/") - 1;
		count = [count, 0].max;
		ret = ("../" * count);
		ret = ret + input;
		ret;
    end
  end
end

Liquid::Template.register_filter(Jekyll::RelativePathToRoot)