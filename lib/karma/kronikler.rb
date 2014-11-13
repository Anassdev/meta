module Karma
  class Kronikler

    def deed_date(deed)
      answer = nil
      if deed.karma_event_type == "Wip"
        awarded = Award.find_by(wip_id: deed.karma_event_id)
        if not awarded.nil?
          answer = awarded.created_at.to_date
        end
      elsif deed.karma_event_type == "Product"
        product = Product.find_by(id: deed.karma_event_id)
        if not product.nil?
          answer = product.created_at.to_date
        end
      elsif deed.karma_event_type == "Tip"
        tip = Tip.find_by(id: deed.karma_event_id)
        if not tip.nil?
          answer = tip.created_at.to_date
        end
      end
      if answer.nil?
        answer = DateTime.now.to_date
      end
      return answer
    end

    def deeds_by_user(user_id)
      deeds = Deed.where(user_id: user_id)
      deed_dates = []
      deeds.each do |d|
        deed_dates.append([d, deed_date(d)])
      end
      deed_dates
      deed_dates.sort{|a,b| a[1] <=> b[1]}
    end

    def karma_history_by_user(user_id)
      deeds = deeds_by_user(user_id)
      #wips, tips, invites, products
      sums = [[DateTime.now.to_s,0,0,0,0]]
      deeds.each do |d|
        temp = sums.last.dup
        temp[0] = (deed_date(d[0]) - Date.new(1970,1,1)).to_i
        #temp[0] = deed_date(d[0])
        if d[0].karma_event_type=="Wip"
          temp[1]=temp[1]+d[0].karma_value
        elsif d[0].karma_event_type=="Tip"
          temp[2]=temp[2]+d[0].karma_value
        elsif d[0].karma_event_type=="Invite"
          temp[3] = temp[3]+d[0].karma_value
        elsif d[0].karma_event_type == "Product"
          temp[4]=temp[4]+d[0].karma_value
        end
        sums.append(temp)
      end
      sums = sums[1, sums.count]
      return sums
    end

    def product_of_deed(deed)
      answer = nil
      if deed.karma_event_type == "Product"
        answer = Product.find(deed.karma_event_id).name
      elsif deed.karma_event_type == "Wip"
        answer = Product.find(Wip.find(deed.karma_event_id).product_id).name
      elsif deed.karma_event_type == "Tip"
        answer = Product.find(Tip.find(deed.karma_event_id).product_id).name
      elsif deed.karma_event_type =="Invite"
        invite = Invite.find(deed.karma_event_id)
        if invite.via_type == "Product"
          answer = Product.find(invite.via_id).name
        elsif invite.via_type == "Wip"
          answer = Product.find(Wip.find(invite.via_id).product_id).name
        end
      end
      return answer
    end

    def karma_product_associations_by_user(user_id)
      deeds = deeds_by_user(user_id)
      history = []

      deeds.map{|row| row[0]}.each do |d|
        tempentry= []
        if d.karma_event_type == "Product"
          tempentry.append(Product.find(d.karma_event_id).name)
        elsif d.karma_event_type == "Wip"
          tempentry.append(Product.find(Wip.find(d.karma_event_id).product_id).name)
        elsif d.karma_event_type == "Tip"
          tempentry.append(Product.find(Tip.find(d.karma_event_id).product_id).name)
        elsif d.karma_event_type =="Invite"
          invite = Invite.find(d.karma_event_id)
          if invite.via_type == "Product"
            tempentry.append(Product.find(invite.via_id).name)
          elsif invite.via_type == "Wip"
            tempentry.append(Product.find(Wip.find(invite.via_id).product_id).name)
          end
        end
        tempentry.append(d.karma_value)
        #tempentry.append( (deed_date(d)-Date.new(1970,1,1)).to_i )
        tempentry.append(deed_date(d))
        history.append(tempentry)
      end
      return history
    end

    def karma_product_history_by_user(user_id)

      product_history = karma_product_associations_by_user(user_id)
      product_names = product_history.map{|row| row[0]}.uniq

      history = [[0]*(product_names.count+1)]

      product_history.each do |p|
        productname = p[0]
        prod_position = product_names.index(productname)+1
        tempentry = history.last.dup
        tempentry[0] = p[2]
        tempentry[prod_position] = tempentry[prod_position] + p[1]
        history.append(tempentry)
      end
      newhistory = []
      #make into fractions
      n=0
      history.each do |p|
        sum = p[1, p.count].sum
        if sum == 0
          sum=1
        end
        r = []
        n=n+1
        r.append(p[0])
        p[1, p.count].each do |a|
          a = a.to_f / sum.to_f*100.0
          r.append(a)
        end
        newhistory.append(r)
      end


      return newhistory[1, newhistory.count], product_names

    end


    def product_text(deed)
      username = User.find_by(id: deed.user_id).username
      product_name = Product.find_by(id: deed.karma_event_id).name
      date = Date.parse(deed_date(deed).to_s).strftime("%m-%d-%Y")
      text = "#{product_name} was founded on #{date} by the visionary, #{username}."

    end

    def tip_text(deed)
      tip =  Tip.find_by(id: deed.karma_event_id)
      recipient = User.find_by(id: tip.to_id).username
      giver = User.find_by(id: tip.from_id).username
      amount = tip.cents
      product_name = Product.find_by(id: tip.product_id).name
      date = Date.parse(deed_date(deed).to_s).strftime("%m-%d-%Y")
      text = "#{recipient} was tipped #{amount} #{product_name} coins on #{date} by #{giver}."

    end

    def invite_text(deed)

      invite = Invite.find_by(id: deed.karma_event_id)
      if not invite.nil?
        invitor = User.find_by(id: invite.invitor_id).username
        invitee = User.find_by(id: invite.invitee_id)
        if not invitee.nil?
          invitee=invitee.username
        else
          invitee=invite.invitee_email
        end
        date = Date.parse(deed_date(deed).to_s).strftime("%m-%d-%Y")
        invite_type = invite.via_type

        if deed.karma_value <5 #was just a request
          work_message = "#{invitor} invited #{invitee} "
          if invite_type == "Product"
            product_name = Product.find_by(id: invite.via_id).name
            work_message = work_message + "to work on #{product_name}."
          elsif invite_type == "Wip"
            bounty_title = Task.find_by(id: invite.via_id).title
            work_message =  work_message + "to work on #{bounty_title}."
          end
        elsif deed.karma_value >=5 #the work was actually done
          if invite_type == "Product"
            product_name = Product.find_by(id: invite.via_id).name
            work_message = "#{invitor} asked #{invitee} to join him on #{product_name}.  #{invitee} answered the call!"
          elsif invite_type == "Wip"
            bounty_title = Task.find_by(id: invite.via_id).title
            work_message = "#{invitee} worked on #{bounty_title}, after the suggestion of #{invitor}."
          end
        end
        return work_message

      end


    end

    def wip_text(deed)
      worker = User.find_by(id: deed.user_id).username
      task = Task.find_by(id: deed.karma_event_id)
      bounty_title = task.title
      productname = Product.find_by(id: task.product_id).name

      date = Date.parse(deed_date(deed).to_s).strftime("%m-%d-%Y")
      message = "#{worker} completed #{bounty_title} on #{date} for #{productname}."

    end


    def convert_deed_to_text(deed)
      if deed.karma_event_type == "Product"
        product_text(deed)
      elsif deed.karma_event_type == "Tip"
        tip_text(deed)
      elsif deed.karma_event_type == "Invite"
        invite_text(deed)
      elsif deed.karma_event_type == "Wip"
        wip_text(deed)
      end
    end

  def make_kronikle(user_id)
    deeds = deeds_by_user(user_id)
    kronikle = ""
    deeds.each do |d|
      kronikle = kronikle + convert_deed_to_text(d[0])
    end
    return kronikle
  end

  end
end
