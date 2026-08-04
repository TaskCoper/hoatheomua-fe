'use client'

import '@/styles/tiptap.scss'

import '@/components/tiptap-node/blockquote-node/blockquote-node.scss'
import '@/components/tiptap-node/code-block-node/code-block-node.scss'
import '@/components/tiptap-node/heading-node/heading-node.scss'
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss'
import '@/components/tiptap-node/image-node/image-node.scss'
import '@/components/tiptap-node/image-upload-node/image-upload-node.scss'
import '@/components/tiptap-node/list-node/list-node.scss'
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss'

import { BlockquoteButton } from '@/components/tiptap-ui/blockquote-button'
import { CodeBlockButton } from '@/components/tiptap-ui/code-block-button'
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu'
import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button'
import { LinkPopover } from '@/components/tiptap-ui/link-popover'
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu'
import { MarkButton } from '@/components/tiptap-ui/mark-button'
import { FieldError } from '@/components/ui/field'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTranslation } from '@/lib/i18n/dictionary-provider'
import type { I18nKey } from '@/lib/i18n/types'
import { MAX_UPLOAD_IMAGE_SIZE } from '@/shared/constants'
import { cn } from '@/shared/utils'
import { Attachment01Icon, MoreHorizontalSquare01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import FileHandler from '@tiptap/extension-file-handler'
import { Image } from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extensions'
import { type Editor, EditorContent, EditorContext, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { ImageUploadNode } from './tiptap-node/image-upload-node'
import { Button } from './tiptap-ui-primitive/button'
import { Card, CardBody } from './tiptap-ui-primitive/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './tiptap-ui-primitive/dropdown-menu'
import { Progress } from './ui/progress'

interface RichTextEditorProps {
  isDisplay?: boolean
  isInitialFocus?: boolean
  compact?: boolean
  content: string
  placeholder?: I18nKey
  onChange: (html: string) => void
  invalid?: boolean
  error?: { message?: string }
  className?: string
}

export default function RichTextEditor({
  content,
  isDisplay = true,
  isInitialFocus = false,
  compact = false,
  onChange,
  placeholder = 'richTextEditor.placeholder',
  invalid = false,
  error,
  className
}: RichTextEditorProps) {
  const { t, locale } = useTranslation()
  const { uploadFileWithToast } = useUploadFileWithToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const placeholderText: string = t(placeholder)

  // Keep onChange in a ref so updating it doesn't recreate the editor.
  // Recreating mid-render destroys the editor's view while child UI (LinkPopover, etc.)
  // still holds the reference, causing `editor.can()` to crash on a null view.
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Track the latest HTML we emitted upward, so the content-sync effect can
  // distinguish "external content change" from "echo of our own onUpdate".
  const lastEmittedHtmlRef = useRef<string>(content)

  const handleUploadAndInsertFile = useCallback(
    async (editor: Editor, file: File, pos?: number) => {
      await uploadFileWithToast({
        file,
        renderProgress: (progress) => (
          <div className='w-72 space-y-1'>
            <Progress value={progress} className='w-full' />
            <p className='text-xs text-muted-foreground'>{progress}%</p>
          </div>
        ),
        onUploaded: (url) => {
          const insertPos = pos ?? editor.state.selection.anchor
          const isImage = file.type.startsWith('image/')

          if (isImage) {
            editor
              .chain()
              .insertContentAt(insertPos, {
                type: 'image',
                attrs: { src: url }
              })
              .focus()
              .run()
            return
          }

          editor
            .chain()
            .insertContentAt(insertPos, {
              type: 'text',
              text: file.name,
              marks: [
                {
                  type: 'link',
                  attrs: { href: url, target: '_blank' }
                }
              ]
            })
            .focus()
            .run()
        }
      })
    },
    [uploadFileWithToast]
  )

  const extensions = useMemo(
    () => [
      StarterKit,
      Image,
      FileHandler.configure({
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        onDrop: (currentEditor, files, pos) => {
          files.forEach((file) => {
            handleUploadAndInsertFile(currentEditor, file, pos)
          })
        },
        onPaste: (currentEditor, files, htmlContent) => {
          if (htmlContent) {
            // if there is htmlContent, let other extensions handle insertion via inputRule
            return false
          }
          files.forEach((file) => {
            handleUploadAndInsertFile(currentEditor, file)
          })
        }
      }),
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_UPLOAD_IMAGE_SIZE,
        limit: 1,
        upload: async (file) => {
          const url = await uploadFileWithToast({
            file,
            renderProgress: (progress) => (
              <div className='w-72 space-y-1'>
                <Progress value={progress} className='w-full' />
                <p className='text-xs text-muted-foreground'>{progress}%</p>
              </div>
            )
          })

          return url ?? ''
        },
        onError: (error) => {
          if (error instanceof Error) {
            toast.error(error.message)
          }
        }
      }),
      Placeholder.configure({
        placeholder: ({ editor }) => {
          if (editor.isEmpty) {
            return placeholderText
          }
          return ''
        },
        emptyEditorClass: 'is-editor-empty'
      })
    ],
    [handleUploadAndInsertFile, uploadFileWithToast, placeholderText]
  )

  const editor = useEditor(
    {
      extensions: extensions,
      editorProps: {
        attributes: {
          class: cn(
            'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl p-4 min-h-48 max-h-96 overflow-auto',
            className
          )
        }
      },
      content,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML()
        lastEmittedHtmlRef.current = html
        onChangeRef.current(html)
      },
      // Don't render immediately on the server to avoid SSR issues
      immediatelyRender: false
    },
    // Only recreate the editor on locale change. onChange/placeholder go through refs.
    [locale]
  )

  useEffect(() => {
    if (isDisplay && isInitialFocus && editor) {
      setTimeout(() => {
        editor.commands.focus('end')
      }, 0)
    }
  }, [isDisplay, isInitialFocus, editor])

  useEffect(() => {
    if (!editor) return
    // Skip if this `content` is just the echo of our own onUpdate - prevents a
    // feedback loop (setContent → onUpdate → onChange → new content prop → setContent…).
    if (content === lastEmittedHtmlRef.current) return
    if (content === editor.getHTML()) return
    editor.commands.setContent(content, { emitUpdate: false })
  }, [content, editor])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor || !e.target.files) return

    const files = Array.from(e.target.files)
    files.forEach((file) => {
      handleUploadAndInsertFile(editor, file)
    })

    // Reset the input so the same file can be selected again
    e.target.value = ''
  }

  if (isDisplay && editor) {
    return (
      <div className='space-y-1'>
        <EditorContext.Provider value={{ editor }}>
          <div
            className={cn(
              'border bg-background focus-within:ring-2 rounded-3xl',
              invalid ? 'border-destructive focus-within:ring-destructive' : 'border-border focus-within:ring-primary'
            )}
          >
            <div className='p-2 flex gap-2 border-b items-center flex-wrap'>
              {compact ? (
                // Compact toolbar for narrow spaces
                <>
                  <HeadingDropdownMenu editor={editor} levels={[1, 2, 3, 4, 5, 6]} hideWhenUnavailable={true} />

                  <div className='w-px h-6 bg-border' />

                  <div className='flex gap-0.5'>
                    <MarkButton type='bold' />
                    <MarkButton type='italic' />
                  </div>

                  <div className='w-px h-6 bg-border' />

                  <div className='flex gap-0.5'>
                    <LinkPopover editor={editor} hideWhenUnavailable={true} autoOpenOnLinkActive={true} />

                    <ImageUploadButton editor={editor} hideWhenUnavailable={true} />

                    <Button
                      type='button'
                      data-style='ghost'
                      className='size-8'
                      onClick={() => fileInputRef.current?.click()}
                      title={t('richTextEditor.attachFile')}
                    >
                      <HugeiconsIcon icon={Attachment01Icon} className='size-4' />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type='file'
                      multiple
                      className='hidden'
                      onChange={handleFileInputChange}
                    />
                  </div>

                  <div className='w-px h-6 bg-border' />

                  <ListDropdownMenu editor={editor} types={['bulletList', 'orderedList']} hideWhenUnavailable={true} />

                  <div className='w-px h-6 bg-border' />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type='button' data-style='ghost' title={t('common.ui.more')}>
                        <HugeiconsIcon icon={MoreHorizontalSquare01Icon} className='tiptap-button-icon' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' sideOffset={8} className='min-w-0'>
                      <Card>
                        <CardBody className='flex flex-col gap-1'>
                          <MarkButton type='strike' text={t('richTextEditor.strikethrough')} />
                          <MarkButton type='code' text={t('richTextEditor.inlineCode')} />
                          <BlockquoteButton editor={editor} text={t('richTextEditor.blockquote.label')} />
                          <CodeBlockButton
                            editor={editor}
                            hideWhenUnavailable={true}
                            text={t('richTextEditor.codeBlock.label')}
                          />
                        </CardBody>
                      </Card>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                // Full toolbar
                <>
                  {/* Headings */}
                  <HeadingDropdownMenu editor={editor} levels={[1, 2, 3, 4, 5, 6]} hideWhenUnavailable={true} />

                  <div className='w-px h-6 bg-border' />

                  {/* Marks */}
                  <div className='flex gap-0.5'>
                    <MarkButton type='bold' />
                    <MarkButton type='italic' />
                    <MarkButton type='strike' />
                    <MarkButton type='code' />
                  </div>

                  <div className='w-px h-6 bg-border' />

                  {/* Lists */}
                  <ListDropdownMenu editor={editor} types={['bulletList', 'orderedList']} hideWhenUnavailable={true} />

                  <div className='w-px h-6 bg-border' />

                  <div className='flex gap-0.5'>
                    {/* Links */}
                    <LinkPopover editor={editor} hideWhenUnavailable={true} autoOpenOnLinkActive={true} />

                    {/* Images */}
                    <ImageUploadButton editor={editor} hideWhenUnavailable={true} />

                    {/* File Attachments */}
                    <Button
                      type='button'
                      data-style='ghost'
                      className='size-8'
                      onClick={() => fileInputRef.current?.click()}
                      title={t('richTextEditor.attachFile')}
                    >
                      <HugeiconsIcon icon={Attachment01Icon} className='size-4' />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type='file'
                      multiple
                      className='hidden'
                      onChange={handleFileInputChange}
                    />
                  </div>

                  <div className='w-px h-6 bg-border' />

                  <div className='flex gap-0.5'>
                    {/* Blockquotes */}
                    <BlockquoteButton editor={editor} />

                    {/* Code blocks */}
                    <CodeBlockButton editor={editor} hideWhenUnavailable={true} />
                  </div>
                </>
              )}
            </div>
            <EditorContent editor={editor} />
          </div>
        </EditorContext.Provider>

        {invalid && error && <div className='min-h-4'>{<FieldError className='text-xs' errors={[error]} />}</div>}
      </div>
    )
  }

  return null
}
