// executeBindings
function executeBindings(bindings, vmodel) {
    for (var i = 0, binding; binding = bindings[i++]; ) {
        binding.vmodel = vmodel
        var isBreak = directives[binding.type].init(binding)
        avalon.injectBinding(binding)
        if (isBreak === false)
            break
    }
    bindings.length = 0
}

function bindingIs(a, b) {
    return a === b
}

avalon.injectBinding = function (binding) {
    parseExpr(binding.expr, binding.vmodel, binding)
    binding.paths.split("★").forEach(function (path) {
        var trim = path.trim()
        if (trim) {
            try {
                binding.vmodel.$watch(path, binding)
            } catch (e) {
                avalon.log(binding, path)
            }
        }
    })
    delete binding.paths
    binding.update = function (a, b, path) {

        var hasError
        try {
            var value = binding.getter(binding.vmodel)
        } catch (e) {
            hasError = true
            avalon.log(e)
        }
        var dir = directives[binding.type]
        var is = dir.is || bindingIs

        if (!is(value, binding.oldValue)) {
            dir.change(value, binding)
            if (binding.oneTime && !hasError) {
                dir.change = noop
                setTimeout(function () {
                    delete binding.element
                })
            }
            if (dir.old) {
                dir.old(binding, value)
            } else {
                binding.oldValue = value
            }
        }
    }
    binding.update()
}

//一个指令包含以下东西
//init(binding) 用于处理expr
//change(val, binding) 用于更新虚拟DOM树及添加更新真实DOM树的钩子
//update(dom, vnode)   更新真实DOM的具体操作 
//is(newValue, oldValue)? 比较新旧值的方法
//old(binding, oldValue)? 如何保持旧值 


