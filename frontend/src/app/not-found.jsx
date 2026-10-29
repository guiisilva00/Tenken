import FigureNotFound from "@/components/figureNotFound" 
export default function NotFound() {
  return (
    <>
        <div className="container-notfound">
            <div className="flex-notfound">
                <h2>404</h2>
                <p>Pagina não encontrada</p>
                <FigureNotFound/>
         </div>
        </div>
    </>
  )
}