// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { EventSelf } from "./event";
import { Observer, subject } from "./util/ObserveEvent";

const {ccclass, property} = cc._decorator;

@ccclass
@subject
export default class NewClass extends cc.Component {

    @property(cc.Node)
    slotsContent: cc.Node = null;

    @property(cc.Prefab)
    button: cc.Prefab = null;

    // 主脚本
    mainTs: cc.Component;

    // slots表
    slots: Map<string, Array<string>>;

    // 记录点击的slot
    slotName:string;
    choseButton: cc.Node;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.mainTs = this.node.getComponent("test")

        this.slots = new Map;

        Observer.onSubjectNotify(this.mainTs, this, (spine:sp.Skeleton)=>{

            // console.log(spine.skeletonData.skeletonJson)

            let animations:Object = spine.skeletonData.skeletonJson['animations']

            for(let animName in animations){
                // console.log(animName)
                this.slots.set(animName, new Array)
                
                let slots = animations[animName]['slots']
                for(let slotName in slots){
                    this.slots.get(animName).push(slotName)
                }
            }

        }, EventSelf.LOAD_SPINE)

        // 监听spine切换事件
        Observer.onSubjectNotify(this.mainTs, this, this.handleSpineChange, EventSelf.SPINE_CHANGE)
        
    }

    start () {

    }

    handleSpineChange(button:cc.Button, spine:sp.Skeleton, spineName:string){
        // console.log(this.slots.get(spineName))

        let spineNameArr = this.slots.get(spineName)

        if(!spineNameArr)return;

        this.slotsContent.destroyAllChildren()
        this.choseButton = null;

        for(let i = 0; i < spineNameArr.length; i++){
            let button = cc.instantiate(this.button);
            button.name = spineNameArr[i];
            this.slotsContent.addChild(button);
            button.getChildByName("Background").getChildByName("item").getComponent(cc.Label).string = spineNameArr[i]

            button.on(cc.Node.EventType.TOUCH_START, ()=>{
                this.slotName = spineNameArr[i]
                button.getChildByName("Background").color = new cc.Color(204, 255, 238);
                if(this.choseButton){
                    this.choseButton.getChildByName("Background").color = new cc.Color(255,255,255); 
                }

                this.choseButton = button;
            })

        }


    }

    // update (dt) {}
}
