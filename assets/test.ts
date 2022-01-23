// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { EventSelf } from "./event";
import { FileUtil, READ_FILE_TYPE } from "./fileUtil";
import { subject } from "./util/ObserveEvent";

const {ccclass, property} = cc._decorator;

@ccclass
@subject
export default class MainCom extends cc.Component {

    @property(cc.Node)
    display: cc.Node = null;
    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Prefab)
    button: cc.Prefab = null;

    choseButton:cc.Node = null;

    nameChoseButton:cc.Node = null;


    //spine读取
    @property(cc.Node)
    jsonButton:cc.Node = null;
    jsonFile:File = null;
    @property(cc.Node)
    atlasButton:cc.Node = null;
    atlasFile:File = null;
    @property(cc.Node)
    imgButton:cc.Node = null;
    imgFileArray:Array<File> = new Array();
    @property(cc.Node)
    imgClearButton:cc.Node = null;
    @property(cc.Node)
    readerSpineButton:cc.Node = null;

    //参考图
    @property(cc.Node)
    addSpriteButton:cc.Node = null;
    @property(cc.Node)
    clearSpiteButton:cc.Node = null;
    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    //缩放
    @property(cc.Node)
    scaleButton:cc.Node = null;

    //贴图预乘
    @property(cc.Node)
    premultipliedAlphaSwitch:cc.Node = null;

    fileUtil:FileUtil = new FileUtil()
    spineShowIndex: number;
    spineShowFuncList: Function[];
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let scaleNumberTable = [0.1,0.25,0.5,1,2,4];
        let scaleIndex = 3;
        //注册缩放事件
        this.scaleButton.on(cc.Node.EventType.TOUCH_END, _=>{
            scaleIndex = scaleIndex + 1 > 5 ? 0 : scaleIndex + 1;
            this.display.setScale(scaleNumberTable[scaleIndex]);
            this.scaleButton.getChildByName("Background").getChildByName("item").getComponent(cc.Label).string = "x" + scaleNumberTable[scaleIndex];
        })

        //注册参考图按钮事件
        this.addSpriteButton.on(cc.Node.EventType.TOUCH_END, _=>{
            this.fileUtil.openLocalFile(".*", (file)=>{
                if(file[0].type != "image/png") return

                this.fileUtil.readLocalFile(file[0], READ_FILE_TYPE.DATA_URL, (imgResult: string | ArrayBuffer) => {
                    if (imgResult) {
                        let fileBase64 = imgResult.toString();
                        this.fileUtil.base64ToTexture2D(fileBase64, (texture: cc.Texture2D) => {
                            this.sprite.spriteFrame = new cc.SpriteFrame(texture)
                        });
                    }
                });
            })
        })

        this.clearSpiteButton.on(cc.Node.EventType.TOUCH_END, _=>{
            this.sprite.spriteFrame = null;
        })

        //注册按钮点击事件
        this.jsonButton.on(cc.Node.EventType.TOUCH_END, _=>{
            this.fileUtil.openLocalFile(".json", (file)=>{
                this.jsonFile = file[0]
            })
        })
        this.atlasButton.on(cc.Node.EventType.TOUCH_END, _=>{
            this.fileUtil.openLocalFile(".atlas", (file)=>{
                this.atlasFile = file[0]
            })
        })
        this.imgButton.on(cc.Node.EventType.TOUCH_END, _=>{
            this.fileUtil.openLocalFile(".png", (file)=>{
                for(let i = 0; i < file.length; i++)
                    this.imgFileArray.push(file[i])
            })
        })
        this.imgClearButton.on(cc.Node.EventType.TOUCH_END, _=>{
            this.imgFileArray = new Array()
        })

        this.spineShowFuncList = new Array<Function>();
        this.spineShowIndex = 0;

        //当读取spine按钮按下
        this.readerSpineButton.on(cc.Node.EventType.TOUCH_END, _=>{
            let node = new cc.Node('spineNode');
            let ske = node.addComponent(sp.Skeleton);

            this.premultipliedAlphaSwitch.on(cc.Node.EventType.TOUCH_END, ()=>{
                ske.premultipliedAlpha = !ske.premultipliedAlpha;
            })

            this.fileUtil.readSpineFile(this.jsonFile, this.atlasFile, this.imgFileArray, ske, _=>{
                ske.premultipliedAlpha = false;
                this.display.addChild(node);
                let keys = Object.keys(ske.skeletonData.skeletonJson.animations)

                keys.forEach((value,index)=>{
                    let button = cc.instantiate(this.button);
                    button.name = value;
                    button.getChildByName("Background").getChildByName("item").getComponent(cc.Label).string = value;
                    //切换spine事件
                    this.spineShowFuncList[index] = _=>{
                        if(this.choseButton)this.choseButton.getChildByName("Background").color = new cc.Color(255,255,255);
                        button.getChildByName("Background").color = new cc.Color(204, 255, 238);
                        this.choseButton = button;
                        ske.setAnimation(0, value, true);
                        this.spineShowIndex = index;

                        this.notify(EventSelf.SPINE_CHANGE, button, ske, value); //第一个参数button，第二个参数spine，第三个参数spine名称
                    };
                    button.on(cc.Node.EventType.TOUCH_START, this.spineShowFuncList[index])
                    this.content.addChild(button);

                    this.notify(EventSelf.BUTTON_CREATOR, button)
                })
    
                // ske.setAnimation(0, keys[0], true);
                this.spineShowFuncList[0]()
                this.notify(EventSelf.LOAD_SPINE, ske);
            })
        })

        let frameSize = cc.view.getFrameSize();

        //下一张
        this.node.parent.on(cc.Node.EventType.TOUCH_END, (event:cc.Event.EventTouch)=>{
            let touchLocation = event.getLocation();
            if(!(touchLocation.x > frameSize.width/4 && touchLocation.x < frameSize.width*3/4))return null;
            let point = touchLocation.x - frameSize.width/2;
            let nextShowIndex = this.spineShowIndex;
            if(point < 0){
                nextShowIndex--;
            }else{
                nextShowIndex++;
            }
            if(nextShowIndex<0)nextShowIndex = this.spineShowFuncList.length-1;
            if(nextShowIndex>this.spineShowFuncList.length-1)nextShowIndex = 0;

            // this.spineButtonList[nextShowIndex].dispatchEvent(new cc.Event.EventTouch(new Array(), false));
            this.spineShowFuncList[nextShowIndex]();
        })

    }

    start () {

    }

    // update (dt) {}
}
