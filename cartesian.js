/*

  Copyright (c) 2017 Martin Sustrik

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"),
  to deal in the Software without restriction, including without limitation
  the rights to use, copy, modify, merge, publish, distribute, sublicense,
  and/or sell copies of the Software, and to permit persons to whom
  the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included
  in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
  THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
  IN THE SOFTWARE.

*/

function alt() {
    var args = []
    for(var i = 0; i < arguments.length; i++) args.push(arguments[i])
    return {__alt__: args}
}

function expand(expr) {
    // primitive type
    if(typeof(expr) !== 'object') return [expr]
    // alt
    if('__alt__' in expr) {
        var res = []
        for(var i = 0; i < expr.__alt__.length; i++) {
            var s = expand(expr.__alt__[i])
            for(var j = 0; j < s.length; j++) res.push(s[j])
        }
        return res
    }
    // array
    if(Array.isArray(expr)) {
        if(expr.length == 0) return [[]]
        var head = expand(expr[0])
        var tail = expand(expr.slice(1))
        var res = []
        for(var i = 0; i < head.length; i++) {
            for(var j =  0; j < tail.length; j++)
                res.push([head[i]].concat(tail[j]))
        }
        return res
    }
    // object
    res = [{}]
    for(var name in expr) {
        // find the property descriptor, even if it is in a base class
        for(it = expr; it != null; it = it.__proto__) {
            var desc = Object.getOwnPropertyDescriptor(it, name)
            if(desc != undefined) break
        }
        // getter functions are copied to the result
        if(desc.get != undefined) {
            for(var i = 0; i < res.length; i++)
                Object.defineProperty(res[i], name, desc)
            continue;
        }
        // child objects are recursively expanded
        var s = expand(expr[name])
        var old = res
        res = []
        for(var i = 0; i < old.length; i++) {
            for(var j = 0; j < s.length; j++) {
                var obj = {}
                for(var prop in old[i]) {
                    var desc = Object.getOwnPropertyDescriptor(old[i], prop)
                    Object.defineProperty(obj, prop, desc)
                }
                obj[name] = s[j]
                res.push(obj)
            }
        }
    }
    old = res
    res = []
    for(var i = 0; i < old.length; i++) {
        // if 'is' property is false the object will not be part of the result
        if('is' in old[i] && !old[i].is) continue
        // 'is' itself is not in the result as it would be always true anyway
        delete old[i].is
        // evaluate any getter functions (poor-man's memoization)
        for(name in old[i])
            Object.defineProperty(old[i], name, {value: old[i][name]}) 
        res.push(old[i]);
    }
    return res
}

exports.alt = alt
exports.expand = expand

