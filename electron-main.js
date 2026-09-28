const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
let serverRef;
async function main(){
  process.env.FEIRA_DATA_DIR = path.join(app.getPath('userData'),'data');
  const { createServer } = require('./server');
  serverRef=createServer();
  try{
    const {port}=await serverRef.start(3000);
    const win=new BrowserWindow({width:1060,height:760,minWidth:850,minHeight:650,autoHideMenuBar:true,title:'Feira de Ciências - Central do Servidor',webPreferences:{contextIsolation:true}});
    await win.loadURL(`http://127.0.0.1:${port}/servidor.html`);
    // Janelas abertas pela Central (dashboard, pesquisa e relatório) sem barra de menu.
    win.webContents.setWindowOpenHandler(({url})=>({
      action:'allow',
      overrideBrowserWindowOptions:{autoHideMenuBar:true,minWidth:900,minHeight:650}
    }));
    win.webContents.on('did-create-window',(child,details)=>{
      child.setMenuBarVisibility(false);
      if(details.url && details.url.includes('/dashboard.html')) child.maximize();
    });
    win.on('close',e=>{if(!app.isQuitting){e.preventDefault();const r=dialog.showMessageBoxSync(win,{type:'question',buttons:['Cancelar','Encerrar servidor'],defaultId:0,cancelId:0,title:'Encerrar servidor?',message:'Deseja encerrar o servidor da Feira de Ciências?',detail:'Os tablets e o dashboard deixarão de acessar a pesquisa.'});if(r===1){app.isQuitting=true;serverRef.server.close(()=>app.quit());}}});
  }catch(e){dialog.showErrorBox('Não foi possível iniciar o servidor',e.message);app.quit();}
}
app.whenReady().then(main);app.on('window-all-closed',()=>{if(process.platform!=='darwin'&&app.isQuitting)app.quit()});
