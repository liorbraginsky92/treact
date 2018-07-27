import { Time as FormattedTime } from 'components/Time'
import { PreviewMedia } from 'containers/Media'
import { PeerPhoto } from 'containers/PeerPhoto'
import styled from 'glamorous'
import { cond, isEmpty, prop, propIs, T } from 'ramda'
import * as React from 'react'
import { MtpMessage } from 'store/mtproto'
import { Themeable } from 'themes/theme.h'
import * as style from './style'

const active = 'active'

const Counter = styled.div<Themeable>(({ theme }) => ({
  backgroundColor: theme.dialogsUnreadBg,
  borderRadius: '19px',
  fontSize: '12px',
  fontWeight: 700,
  minWidth: '9px',
  padding: '1px 5px',
  textAlign: 'center',
  [`.${active} &`]: {
    backgroundColor: theme.dialogsUnreadBgActive,
  },
}))

const StyledUnreadBadge = styled.div<UnreadProps & Themeable>(({ unread, theme }) => ({
  display: unread ? 'block' : 'none',
  color: theme.dialogsUnreadFg,
  [`.${active} &`]: {
    color: theme.dialogsUnreadFgActive,
  },
}))

const StyledSenderPreview = styled.div<SenderProps & Themeable>(({ theme, userName }) => ({
  display: userName ? 'inline-block' : 'none',
  color: theme.dialogsTextFgService,
  paddingRight: '4px',
  [`.${active} &`]: {
    color: theme.dialogsTextFgServiceActive,
  },
}))

const StyledMessagePreview = styled.div<Themeable>(({ theme }) => ({
  flex: 1,
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  color: theme.dialogsTextFg,
  [`.${active} &`]: {
    color: theme.dialogsTextFgActive,
  },
}))

type DialogItemProps = { active: boolean }
const StyledDialogItem = styled.div<DialogItemProps & Themeable>({
  height: '62px',
  paddingRight: '10px',
}
, props => props.active ? active : {}
, ({ theme }) => ({
  backgroundColor: theme.dialogsBg,
  ':hover': {
    backgroundColor: theme.dialogsBgOver,
  },
  [`&.${active}, &.${active}:hover`]: {
    backgroundColor: theme.dialogsBgActive,
    marginRight: '-1px',
  },
}))

const StyledPeerPhoto = styled(PeerPhoto)({
  borderRadius: '50px',
  float: 'left',
  height: '46px',
  width: '46px',
  margin: '8px 10px',
  marginRight: '12px',
})

const Name = styled.div<Themeable>(({ theme }) => ({
  alignSelf: 'center',
  color: theme.dialogsNameFg,
  flex: '1 100%',
  fontWeight: 600,
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  [`.${active} &`]: {
    color: theme.dialogsNameFgActive,
  },
}))

const Time = styled(FormattedTime)<Themeable>(({ theme }) => ({
  alignSelf: 'center',
  color: theme.dialogsDateFg,
  [`.${active} &`]: {
    color: theme.dialogsDateFgActive,
  },
}))

interface ChatListBasicProps {
  id: number
  name: string
  selected: boolean
  click: React.MouseEventHandler<{}>
  date?: number
  children?: React.ReactNode
}

interface ChatListFullProps extends ChatListBasicProps {
  isYou: boolean
  previewName: string
  message: MtpMessage
  unreadCount: number
}

type UnreadProps = { unread: number }
const UnreadBadge = ({ unread }: UnreadProps) => (
  <StyledUnreadBadge unread={unread}>
    <Counter>{unread}</Counter>
  </StyledUnreadBadge>
)

type SenderProps = { userName: string }
const SenderPreview = ({ userName }: SenderProps) => (
  <StyledSenderPreview userName={userName}>
    <span>{userName}</span>
    <span>:</span>
  </StyledSenderPreview>
)

type MessageProps = { children: React.ReactNode, userName: string, isYou: boolean }
const MessagePreview = ({ children, userName, isYou }: MessageProps) => (
  <StyledMessagePreview>
    <SenderPreview userName={isYou ? 'You' : userName} />
    {children}
  </StyledMessagePreview>
)

export const ChatListItemEmpty = ({
  id,
  name,
  click,
  selected,
  children,
  date,
}: ChatListBasicProps) => {
  return (
    <StyledDialogItem
      active={selected}
      onClick={click}>
      <StyledPeerPhoto peerID={id} />
      <div className={style.info}>
        <div className={style.top}>
          <Name>{name}</Name>
          <Time date={date} />
        </div>
        <div className={style.bottom}>
          {children}
        </div>
      </div>
    </StyledDialogItem>
  )
}

const messageIsNotEmpty = (data: MtpMessage) =>
  !isEmpty(data.message)
// TODO: move to container
const shortPreview =
  cond<MtpMessage, React.ReactNode>([
    [messageIsNotEmpty, prop('message')],
    [propIs(Object, 'media'), ({ media }) =>
      <PreviewMedia media={media} />],
    [T, () => 'Unknown case'],
  ])

export const ChatListItem = ({
  id, name, click, selected,
  previewName, message, unreadCount, isYou }: ChatListFullProps) => (
  <ChatListItemEmpty id={id} name={name} click={click} selected={selected} date={message.date}>
    <MessagePreview userName={previewName} isYou={isYou}>
      {shortPreview(message)}
    </MessagePreview>
    <UnreadBadge unread={unreadCount} />
  </ChatListItemEmpty>
)
