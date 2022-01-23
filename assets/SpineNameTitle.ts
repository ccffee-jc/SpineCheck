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

    @property(cc.EditBox)
    edit: cc.EditBox = null;

    // 主脚本
    mainTs: cc.Component;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.mainTs = this.node.getComponent("test")

        // 监听spine切换事件
        Observer.onSubjectNotify(this.mainTs, this, this.handleSpineChange, EventSelf.SPINE_CHANGE)

        this.desableInput()
    }

    //处理spine切换
    handleSpineChange(button:cc.Button, spine:sp.Skeleton, spineName:string){
        this.edit.string = spineName;
    }

    //禁用输入
    desableInput(){
        let swapString:string
        this.edit.node.on('editing-did-began', ()=>{
            swapString = this.edit.string
        })
        this.edit.node.on('text-changed', ()=>{
            this.edit.string = swapString
        })
    }

    start () {

    }

    // update (dt) {}
}
