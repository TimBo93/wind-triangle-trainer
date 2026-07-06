import Modal from './Modal'

interface Props {
  onAccept: () => void
}

export default function DisclaimerModal({ onAccept }: Props) {
  return (
    <Modal title="Winddreieck-Trainer – Hinweis">
      <div className="disclaimer">
        <p>
          Dieses Tool wurde von{' '}
          <strong>
            <a href="https://borowski-software.de/" target="_blank" rel="noopener noreferrer">
              Tim Borowski
            </a>
          </strong>
          , IT-Freelancer, mit Unterstützung von KI entwickelt.
        </p>
        <p>
          Die Nutzung ist <strong>ausschließlich</strong> für den Einsatz im
          Flugsimulator (z.&nbsp;B. Microsoft Flight Simulator / MSFS) bestimmt und
          <strong> nicht</strong> für die reale Luftfahrt zugelassen.
        </p>
        <p>
          Für die Richtigkeit der Berechnungen und Darstellungen kann
          <strong> keine Haftung</strong> übernommen werden.
        </p>
        <p className="modal-repo">
          Quellcode:{' '}
          <a
            href="https://github.com/TimBo93/wind-triangle-trainer"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/TimBo93/wind-triangle-trainer
          </a>
        </p>
        <button type="button" className="btn-primary" onClick={onAccept}>
          Verstanden &amp; akzeptieren
        </button>
      </div>
    </Modal>
  )
}
