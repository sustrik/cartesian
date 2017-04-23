
var c = require('./cartesian.js')

var box1 = {
    hostname: 'box1',
    os: 'linux',
    arch: 'x86-64',
    ram: 8,
}

var box2 = {
    hostname: 'box2',
    os: 'freebsd',
    arch: 'arm',
    ram: 16,
}

var box3 = {
    hostname: 'box3',
    os: 'windows',
    arch: 'x86-64',
    ram: 4,
}

var box4 = {
    hostname: 'box4',
    os: 'illumos',
    arch: 'sparc',
    ram: 4,
}

var compiler = {
    output_option: '-o',
}

var gcc = {
    binary: 'gcc',
    version: '4.8.4',
}
gcc.__proto__ = compiler

var clang = {
    binary: 'clang',
    version: '3.4.1',
}
clang.__proto__ = compiler

var msvc = {
    binary: 'cl.exe',
    version: '15.00.30729.01',
    output_option: '/Fe',
}
msvc.__proto__ = compiler

var frobnicate = {
    binary: 'frobnicate',
    sources: 'frobnicate.c'
}

var loadtest = {
    binary: 'loadtest',
    sources: 'loadtest.c helper.c'
}

var end2end = {
    binary: 'end2end',
    sources: 'end2end.c helper.c'
}

var testsuite = {
    box: c.alt(box1, box2, box3, box4),
    compiler: c.alt(gcc, clang, msvc),
    test: c.alt(frobnicate, loadtest, end2end),
    get cmdline() {
        return this.compiler.binary + ' ' + this.test.sources + ' ' +
            this.compiler.output_option + ' ' + this.test.binary
    },
    get is() {
        if(this.test.binary == 'loadtest' && this.box.ram < 8) return false
        return true
    }
}

var config = c.expand(testsuite)
console.log(JSON.stringify(config, null, '  '))

