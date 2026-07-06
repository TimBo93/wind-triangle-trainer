import Modal from './Modal'

interface Props {
  onClose: () => void
}

export default function LicensesDialog({ onClose }: Props) {
  const src = `${import.meta.env.BASE_URL}licenses.html`
  return (
    <Modal title="Open-Source-Lizenzen" onClose={onClose} wide>
      <p className="modal-repo">
        Projekt-Repository:{' '}
        <a
          href="https://github.com/TimBo93/wind-triangle-trainer"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/TimBo93/wind-triangle-trainer
        </a>
      </p>
      <iframe className="licenses-frame" src={src} title="Open-Source-Lizenzen" />
    </Modal>
  )
}
