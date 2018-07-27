import * as React from 'react'

import { isEmpty, path } from 'ramda'

import { ChatListItem, ChatListItemEmpty } from 'components/ChatListItem'
import { getPeerData, getPeerName, getPeerShortName } from 'helpers/Telegram/Peers'
import { connect } from 'react-redux'
import { selectChat } from 'store/api/chatList'
import { StoreHistory } from 'store/modules/histories'
import { TPeersType } from 'store/modules/peers'
import { MtpChat, MtpDialog, MtpMessage /* MtpMessage */, MtpUser } from 'store/mtproto'
import { Dispatch, Store } from 'store/store.h'

// const getLastMessage =
//  (history: StoreHistory): MtpMessage => history.byId[last<number, typeof history.ids>(history.ids)];

class ChatListItemContainer extends React.Component<Props & Funcs & State, {}> {
  public renderEmptyItem = () => {
    const { id, selected, peer, peerData } = this.props
    return <ChatListItemEmpty
      id={id}
      click={this.click}
      selected={selected}
      name={getPeerName(peer, peerData)}
      />
  }
  public renderItem = () => {
    const { id, selected, peer, peerData, from, fromData, isNotChat, isYou, message } = this.props
    return <ChatListItem
      id={id}
      click={this.click}
      selected={selected}
      name={getPeerName(peer, peerData)}
      unreadCount={this.props.dialog.unread_count}
      previewName={isNotChat ? '' : (getPeerShortName(from, fromData) || '')}
      isYou={isYou}
      message={message}
      />
  }
  public click = () => this.props.click(this.props.id)
  public render() {
    const { history } = this.props
    return isEmpty(history)
      ? this.renderEmptyItem()
      : this.renderItem()
  }
}

interface Props {
  id: number
  dialog: MtpDialog
  history: StoreHistory
  peer: TPeersType
  selected: boolean
}

interface Funcs {
  click(id: number): void
}

interface State {
  peerData: MtpUser | MtpChat
  // TODO: This is arguable (shouldn't be nullable)
  fromData: MtpUser | MtpChat | null
  from: TPeersType
  isNotChat: boolean
  isYou: boolean
  message: MtpMessage
}

const preview = (state: Store, message: MtpMessage, peer: TPeersType) => {
  const fromId = message.from_id || -1
  const from = state.peers.byId[fromId]

  const isNotChat = peer === 'user' || from !== 'user'
  const isYou = !!message.out
  const fromData = !isNotChat ? getPeerData(fromId, from, state) : null

  return {
    isNotChat,
    isYou,
    fromData,
    from: isNotChat ? peer : from,
  }
}

const messagesPath = path(['messages', 'byId'])

const mapState = (state: Store, { id, peer, dialog }: Props): State => {
  const message = (messagesPath(state) as Store['messages']['byId'])[dialog.top_message]
  const peerData = getPeerData(id, peer, state)

  return {
    peerData,
    message,
    ...preview(state, message, peer),
  }
}

const mapDispatch = (dispatch: Dispatch) => ({
  click: (id: number) => dispatch(selectChat(id)),
})

const connected = connect<State, Funcs, Props, Store>(mapState, mapDispatch)(ChatListItemContainer)

export { connected as ChatListItem }
