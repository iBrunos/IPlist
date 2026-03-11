import { Injectable, Logger } from '@nestjs/common'
import { Client } from 'ldapts'

@Injectable()
export class LdapService {
  private readonly logger = new Logger(LdapService.name)

  private readonly url = process.env.LDAP_URL || 'ldap://10.201.131.11:389'
  private readonly baseDN = process.env.LDAP_BASE_DN || 'DC=ADPMS,DC=local'
  private readonly bindDN = process.env.LDAP_BIND_DN
  private readonly bindPassword = process.env.LDAP_BIND_PASSWORD

  private readonly groupRoleMap: Record<string, string> = {
    'CN=SUPER_ADMIN_BIP,OU=Grupos,OU=COGEL,OU=PMS,DC=ADPMS,DC=local': 'super_admin',
    'CN=LIDER_TECNICO_BIP,OU=Grupos,OU=COGEL,OU=PMS,DC=ADPMS,DC=local': 'lidertecnico',
    'CN=TECNICO_BIP,OU=Grupos,OU=COGEL,OU=PMS,DC=ADPMS,DC=local': 'tecnico',
  }

  async authenticate(username: string, password: string): Promise<{
    success: boolean
    role?: string
    email?: string
    equipe?: string
  }> {
    const client = new Client({
      url: this.url,
      tlsOptions: { rejectUnauthorized: false },
    })

    try {
      // Bind com usuário de serviço para buscar o DN do usuário
      if (this.bindDN && this.bindPassword) {
        await client.bind(this.bindDN, this.bindPassword)
      }

      // Buscar o usuário no AD
      const { searchEntries } = await client.search(this.baseDN, {
        scope: 'sub',
        filter: `(&(objectClass=person)(sAMAccountName=${username}))`,
        attributes: ['dn', 'mail', 'department', 'memberOf'],
      })

      if (!searchEntries.length) {
        this.logger.warn(`Usuário ${username} não encontrado no LDAP`)
        return { success: false }
      }

      const userEntry = searchEntries[0]
      const userDN = userEntry.dn

      // Tentar bind com as credenciais do usuário
      await client.bind(userDN, password)

      // Mapear grupos para role
      const memberOf = userEntry.memberOf as string[] | string | undefined
      const groups = Array.isArray(memberOf) ? memberOf : memberOf ? [memberOf] : []

      let role: string | undefined
      for (const group of groups) {
        if (this.groupRoleMap[group]) {
          role = this.groupRoleMap[group]
          break
        }
      }

      if (!role) {
        this.logger.warn(`Usuário ${username} não pertence a nenhum grupo BIP`)
        return { success: false }
      }

      return {
        success: true,
        role,
        email: userEntry.mail as string,
        equipe: userEntry.department as string,
      }

    } catch (err: any) {
      this.logger.error(`Erro LDAP: ${err.message}`)
      return { success: false }
    } finally {
      await client.unbind()
    }
  }
}