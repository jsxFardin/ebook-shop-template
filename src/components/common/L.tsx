import { Link, type LinkProps } from 'react-router'
import { useT } from '../../i18n'

/** Link that prefixes the current locale (/en, /bn) to app-relative paths. */
export default function L({ to, ...rest }: LinkProps & { to: string }) {
  const { to: withLang } = useT()
  return <Link to={to.startsWith('/') ? withLang(to) : to} {...rest} />
}
