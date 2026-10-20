const {app,BrowserWindow,BrowserView,ipcMain,Menu}=require('electron');
const path=require('path'),fs=require('fs'),http=require('http'),{spawn}=require('child_process');
const MODE=process.argv.some(a=>a==='--mode=mc')?'mc':'globe';
const CFG={globe:{url:'http://localhost:4173',title:"God's Eye",icon:'icon.ico',aumid:'com.godseye.godseye',w:1600,h:900,max:true},
 mc:{url:'http://localhost:4180/mission-control',title:'Mission Control',icon:'icon-mc.ico',aumid:'com.godseye.missioncontrol',w:1100,h:800,max:false}}[MODE];
app.setPath('userData',path.join(app.getPath('appData'),'gods-eye-app-'+MODE));
app.setAppUserModelId(CFG.aumid);
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
if(MODE==='globe')app.commandLine.appendSwitch('disable-frame-rate-limit');
if(!app.requestSingleInstanceLock()){app.quit();process.exit(0);}
const TB=30,stateFile=path.join(app.getPath('userData'),'win.json');
let win,view;
const up=u=>new Promise(r=>{const q=http.get(u,{timeout:2500},s=>{s.resume();r(s.statusCode===200)});q.on('error',()=>r(false));q.on('timeout',()=>{q.destroy();r(false)});});
const ps=a=>spawn('powershell.exe',['-NoProfile','-WindowStyle','Hidden',...a],{detached:true,stdio:'ignore',windowsHide:true}).unref();
async function ensure(){
 if(!await up('http://localhost:4173')&&MODE==='globe'){ps(['-ExecutionPolicy','Bypass','-File',process.env.GEV_START_SCRIPT||path.join(require('os').homedir(),'Apps','gods-eye-view','start-detached.ps1')]);for(let i=0;i<40&&!await up('http://localhost:4173');i++)await new Promise(r=>setTimeout(r,1000));}
 if(!await up('http://localhost:4180/mission-control')&&MODE==='mc'){ps(['-Command','Start-ScheduledTask -TaskName MissionControlAutoStart']);for(let i=0;i<20&&!await up(CFG.url);i++)await new Promise(r=>setTimeout(r,1000));}
}
function layout(){if(!win||!view)return;const [w,h]=win.getContentSize();view.setBounds({x:0,y:TB,width:w,height:h-TB});}
app.whenReady().then(async()=>{
 Menu.setApplicationMenu(null);
 let st={};try{st=JSON.parse(fs.readFileSync(stateFile))}catch{}
 win=new BrowserWindow({width:st.width||CFG.w,height:st.height||CFG.h,x:st.x,y:st.y,backgroundColor:'#05080c',title:CFG.title,icon:path.join(__dirname,CFG.icon),frame:false,show:false,
  webPreferences:{preload:path.join(__dirname,'preload.js'),backgroundThrottling:false}});
 const startMax=st.max===undefined?CFG.max:st.max; if(startMax)win.maximize();
 win.loadFile('bar.html',{query:{t:CFG.title}});win.once('ready-to-show',()=>win.show());
 const save=()=>{if(win.isDestroyed())return;fs.writeFileSync(stateFile,JSON.stringify({...win.getNormalBounds(),max:win.isMaximized()}))};
 win.on('close',save);win.on('resize',layout);win.on('maximize',layout);win.on('unmaximize',layout);
 ipcMain.on('win',(e,a)=>{if(a==='min')win.minimize();else if(a==='max')win.isMaximized()?win.unmaximize():win.maximize();else win.close();});
 view=new BrowserView({webPreferences:{backgroundThrottling:false}});win.addBrowserView(view);layout();
 view.webContents.on('did-fail-load',()=>setTimeout(()=>view.webContents.loadURL(CFG.url),3000));
 view.webContents.on('before-input-event',(e,i)=>{if(i.key==='F11'&&i.type==='keyDown')win.setFullScreen(!win.isFullScreen())});
 await ensure();view.webContents.loadURL(CFG.url);setTimeout(layout,500);
});
app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.focus();}});
app.on('window-all-closed',()=>app.quit());
