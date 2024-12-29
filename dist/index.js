var I=Object.create;var l=Object.defineProperty;var O=Object.getOwnPropertyDescriptor;var $=Object.getOwnPropertyNames;var D=Object.getPrototypeOf,L=Object.prototype.hasOwnProperty;var w=s=>l(s,"__esModule",{value:!0});var R=(s,e)=>{w(s);for(var r in e)l(s,r,{get:e[r],enumerable:!0})},W=(s,e,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of $(e))!L.call(s,t)&&t!=="default"&&l(s,t,{get:()=>e[t],enumerable:!(r=O(e,t))||r.enumerable});return s},n=s=>W(w(l(s!=null?I(D(s)):{},"default",s&&s.__esModule&&"default"in s?{get:()=>s.default,enumerable:!0}:{value:s,enumerable:!0})),s);R(exports,{default:()=>G,wasmPack:()=>G});var c="[0m",p="[1m",_="[31m",m="[34m",P="\u2705  ",v="\u2139  ",x="\u26A0  ";var b=n(require("child_process"));var E=n(require("fs")),u=n(require("path"));var k=n(require("fs")),F=n(require("path"));async function*h(s,e,r){for await(let t of await k.promises.opendir(s)){let i=Object.assign(t,{path:F.default.join(s,t.name)});t.isDirectory()&&await e(i)?yield*h(i.path,e,r):t.isFile()&&await r(i)&&(yield i)}}var y=/\.rs$/,C=/^\.|^node_modules$/,f=class{constructor(e=process.cwd()){this._crateRoot=e}loadDepInfo(e){this._depInfoPromise=B(e)}getWatchFiles(){var e;return(e=this._depInfoPromise)!=null?e:A(this._crateRoot)}};async function A(s){let e=[];for await(let r of h(s,t=>!C.test(t.name),t=>y.test(t.name)))e.push(r.path);return e}async function B(s){let{dir:e,name:r}=u.default.parse(s),t=u.default.format({dir:e,name:r,ext:".d"}),i=await E.promises.readFile(t,{encoding:"utf8"}),o=N(i);return o.get(s)||o.values().next().value||[]}function N(s){return new Map(s.split(`
`).map(e=>[e,e.indexOf(": ")]).filter(e=>e[1]!==-1).map(([e,r])=>{let t=e.slice(0,r),i=e.slice(r+2).split(" "),o=[],a;for(;a=i.shift();){for(;a.endsWith("\\");){let g=i.shift();if(!g)throw new Error("malformed dep-info format, trailing \\");a=a.slice(0,-1)+" "+g}o.push(a)}return[t,o]}))}var d=class{constructor(e){this._canceled=!1;this._promise=new Promise(i=>this._resolve=i);let r=process.env.WASM_PACK_PATH||e.wasmPackPath||"wasm-pack",t=["build"];e.logLevel&&t.push("--log-level",e.logLevel),e.profile&&t.push("--"+e.profile),e.noTypescript&&t.push("--no-typescript"),e.mode&&t.push("--mode",e.mode),e.outDir&&t.push("--out-dir",e.outDir),e.outName&&t.push("--out-name",e.outName),e.scope&&t.push("--scope",e.scope),e.target&&t.push("--target",e.target),e.extraPackOptions&&t.push(...e.extraPackOptions),e.path&&t.push(e.path),t.push("--",...e.extraOptions||[],"--message-format=json"),this._watchFiles=new f(e.path),this._process=(0,b.spawn)(r,t,{cwd:process.cwd(),env:process.env,stdio:["ignore","ipc","inherit"],detached:!1,serialization:"json",shell:!1}),this._process.on("error",this._onError.bind(this)),this._process.on("message",this._onMessage.bind(this)),this._process.on("close",this._onClose.bind(this))}waitForClose(){return this._promise}get canceled(){return this._canceled}cancel(){return this._canceled||(this._canceled=!0,this._process.kill()),this._promise}_onError(e){this._error=e}_onMessage(e){if(e.reason=="compiler-artifact"&&(this._lastArtifact=e),e.reason=="build-finished"&&e.success&&this._lastArtifact){let r=this._lastArtifact.filenames[0];r&&this._watchFiles.loadDepInfo(r)}}_onClose(e,r){this._resolve(this._watchFiles.getWatchFiles().then(t=>({canceled:this._canceled,error:this._error,code:e,signal:r,watchFiles:t})))}};var M=["info","warn","error"],S=class{constructor(e={}){this.options=e;this.name="wasm-pack";this.logLevelInt=0;this.wasmProcess=null;this.watchFiles=[];var r;this.logLevelInt=M.indexOf(((r=e.logLevel)!=null?r:"info").toLowerCase())}setup(e){e.onStart(()=>this.wasmPack()),e.onResolve({filter:/.*/},async()=>{var r;return await((r=this.wasmProcess)==null?void 0:r.waitForClose()),{watchFiles:this.watchFiles}})}async wasmPack(){var r;this.info(`Compiling your crate in ${(r=this.options.profile)!=null?r:"<default>"} mode...`),this.wasmProcess&&await this.wasmProcess.cancel(),this.wasmProcess=new d(this.options);let e=await this.wasmProcess.waitForClose();return this.wasmProcess=null,e.watchFiles.length&&(this.watchFiles=e.watchFiles),e.error?e.canceled?(this.error(`Error canceling wasm-pack: ${e.error.message}.`),{errors:[{text:e.error.message,detail:e.error.stack}]}):(this.error(`Error running wasm-pack: ${e.error.message}.`),{errors:[{text:e.error.message,detail:e.error.stack}]}):e.canceled?(this.error("Build was canceled."),{warnings:[{text:"Build was canceled"}]}):e.signal?(this.error(`Error running wasm-pack: process was killed with signal '${e.signal}'.`),{errors:[{text:`Error running wasm-pack: process was killed with signal '${e.signal}'.`}]}):e.code?(this.error("Rust compilation failed."),{errors:[{text:"Rust compilation failed."}]}):(this.success("Your crate was successfully compiled."),{})}success(e){this.logLevelInt<=1&&console.log(`
${P}${p}${m}${e}${c}
`)}info(e){this.logLevelInt<=1&&console.log(`
${v}${p}${m}${e}${c}
`)}error(e){this.logLevelInt<=3&&console.log(`
${x}${p}${_}${e}${c}
`)}};function G(s={}){let e=new S(s);return{name:e.name,setup:e.setup.bind(e)}}0&&(module.exports={wasmPack});